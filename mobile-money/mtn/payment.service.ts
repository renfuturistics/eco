import { PaymentGateway } from "../payment.gateway";
import axios, { AxiosRequestConfig } from "axios";
import uuid from "react-native-uuid";
import { Buffer } from "buffer"; // <-- ADD THIS at the top!!
type Environment = "sandbox" | "production";
export class MtnGateway {
  private readonly CURRENCY: string;
  private readonly ENVIRONMENT: Environment;
  private readonly BASE_URL: string;
  private readonly MOMO_COLLECTION_SECONDARY_KEY: string;
  private static instance: MtnGateway | null = null;
  private API_USER: string;
  private API_KEY: string;
  private readonly CALLBACK_URL: string;
  private readonly CALLBACK_HOST: string;
  private getEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }

  constructor() {
    const isSandbox = (process.env.MOMO_ENV as Environment) !== "production";

    this.ENVIRONMENT = isSandbox ? "sandbox" : "production";
    this.BASE_URL = this.getEnv(
      isSandbox
        ? "EXPO_PUBLIC_MOMO_SANDBOX_BASE_URL"
        : "EXPO_PUBLIC_MOMO_PROD_BASE_URL"
    );
    this.API_USER = this.getEnv(
      isSandbox
        ? "EXPO_PUBLIC_MOMO_SANDBOX_API_USER"
        : "EXPO_PUBLIC_MOMO_PROD_API_USER"
    );
    this.API_KEY = this.getEnv(
      isSandbox
        ? "EXPO_PUBLIC_MOMO_SANDBOX_API_KEY"
        : "EXPO_PUBLIC_MOMO_PROD_API_KEY"
    );
    this.MOMO_COLLECTION_SECONDARY_KEY = this.getEnv(
      "EXPO_PUBLIC_MOMO_COLLECTION_SECONDARY_KEY"
    );
    this.CALLBACK_URL = this.getEnv("EXPO_PUBLIC_MOMO_CALLBACK_URL");
    this.CALLBACK_HOST = this.getEnv("EXPO_PUBLIC_MOMO_CALLBACK_HOST");
    this.CURRENCY = isSandbox ? "EUR" : "ZMW";

    this.validateConfig();

    if (isSandbox) {
      this.setupSandboxCredentials();
    }
  }
  public static getInstance(): MtnGateway {
    if (!MtnGateway.instance) {
      MtnGateway.instance = new MtnGateway();
    }
    return MtnGateway.instance;
  }
  async processPayment(
    referenceId: string,
    accountNumber: string,
    amount: number
  ): Promise<any> {
    const tokenInfo = await this.createAccessToken();

    if (!tokenInfo.success)
      return { success: false, error: tokenInfo.error, gateway: "Mtn Money" };

    const accessToken = tokenInfo.data.access_token;

    return this.requestToPay(referenceId, accountNumber, amount, accessToken);
  }
  private validateConfig() {
    if (
      !this.BASE_URL ||
      !this.MOMO_COLLECTION_SECONDARY_KEY ||
      !this.CALLBACK_URL ||
      !this.CALLBACK_HOST
    ) {
      throw new Error("Missing required MoMo API environment variables.");
    }
  }
  private async setupSandboxCredentials() {
    try {
      const apiUser = await this.createApiUser();
      if (!apiUser) throw new Error("Failed to create API user");
      this.API_USER = apiUser;

      const apiKey = await this.createApiKey(apiUser);
      if (!apiKey) throw new Error("Failed to create API key");
      this.API_KEY = apiKey;
    } catch (error) {
      console.error("Error setting up sandbox credentials:", error);
    }
  }
  private async createApiKey(apiUser: string) {
    try {
      const response = await this.apiRequest(
        "post",
        `v1_0/apiuser/${apiUser}/apikey`
      );
      console.warn("Sandbox collection API Key Created:", response.data.apiKey);
      return response.data.apiKey;
    } catch (error) {
      console.error("Error creating API Key:", error);
      return null;
    }
  }
  private async createApiUser() {
    const referenceId = uuid.v4() as string;
    try {
      await this.apiRequest(
        "post",
        `v1_0/apiuser`,
        { providerCallbackHost: this.CALLBACK_HOST },
        {
          "X-Reference-Id": referenceId,
        }
      );

      return referenceId;
    } catch (error) {
      console.error("Error creating API User:", error);
      return null;
    }
  }
  private async requestToPay(
    order: string,
    accountNumber: string,
    amount: number,
    accessToken: string
  ) {
    return this.apiRequest(
      "post",
      `collection/v1_0/requesttopay`,
      {
        amount: `${amount}`,
        currency: this.CURRENCY,
        externalId: `${order}`,
        payer: { partyIdType: "MSISDN", partyId: `${accountNumber}` },
      },
      {
        "X-Reference-Id": order,
        "X-Callback-Url": this.CALLBACK_URL,
        Authorization: `Bearer ${accessToken}`,
        "X-Target-Environment": this.ENVIRONMENT,
      }
    );
  }
  private async createAccessToken(retries = 3): Promise<any> {
    try {
      return await this.apiRequest("post", `collection/token/`, null, {
        Authorization: `Basic ${Buffer.from(
          `${this.API_USER}:${this.API_KEY}`
        ).toString("base64")}`,
      });
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying token request... Attempts left: ${retries}`);
        return this.createAccessToken(retries - 1);
      }
      return { success: false, error };
    }
  }
  async confirmPayment(uniqid: string) {
    const tokenInfo = await this.createAccessToken();
    if (!tokenInfo.success) return { success: false, error: tokenInfo.error };

    const accessToken = tokenInfo.data.access_token;
    return this.apiRequest(
      "get",
      `collection/v1_0/requesttopay/${uniqid}`,
      null,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );
  }
  async apiRequest(
    method: "get" | "post",
    endpoint: string,
    data: any = null,
    extraHeaders: any = {}
  ) {
    const headers = {
      "X-Target-Environment": this.ENVIRONMENT,
      "Ocp-Apim-Subscription-Key": this.MOMO_COLLECTION_SECONDARY_KEY,
      "Content-Type": "application/json",
      ...extraHeaders,
    };

    const config: AxiosRequestConfig = {
      method,
      url: `${this.BASE_URL}${endpoint}`,
      headers,
      data,
    };
    try {
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(
        `Error in API Request [${method.toUpperCase()} ${endpoint}]:`,
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || error.message,
        stack: error.stack,
        gateway: "Mtn Money",
        data: undefined,
      };
    }
  }
}
