import React from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet } from 'react-native';

type CertificateProps = {
  name: string;
  courseTitle: string;
  completionDate: string;
};
type Course={
    course:CertificateProps
}
const Certificate= ({ name, courseTitle, completionDate }:any) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Background with Border */}
      <View style={styles.certificateWrapper}>
        {/* Decorative Border */}
        <View style={styles.borderTop}></View>

        {/* Certificate Title */}
        <Text style={styles.certTitle}>Certificate of Completion</Text>

        {/* Student's Name */}
        <Text style={styles.studentName}>{name}</Text>

        {/* Course Title */}
        <Text style={styles.courseTitle}>Has successfully completed the course</Text>
        <Text style={styles.courseTitle}>{courseTitle}</Text>

        {/* Completion Date */}
        <Text style={styles.completionDate}>Completion Date: {completionDate}</Text>

        {/* Signature Area */}
        <View style={styles.signatureContainer}>
          <Text style={styles.signature}>Instructor's Signature</Text>
        </View>

        {/* Decorative Border */}
        <View style={styles.borderBottom}></View>

        {/* Logo */}
        <Image source={{ uri: 'https://example.com/logo.png' }} style={styles.logo} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  certificateWrapper: {
    width: '100%',
    maxWidth: 600, // Control max width of the certificate
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  borderTop: {
    borderTopWidth: 5,
    borderColor: '#1a5e60',
    marginBottom: 20,
    width: '30%',
    alignSelf: 'center',
  },
  borderBottom: {
    borderBottomWidth: 5,
    borderColor: '#1a5e60',
    marginTop: 20,
    width: '30%',
    alignSelf: 'center',
  },
  certTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a5e60',
    textAlign: 'center',
    marginVertical: 10,
  },
  courseTitle: {
    fontSize: 22,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
  },
  completionDate: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginVertical: 20,
  },
  signatureContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  signature: {
    fontSize: 16,
    color: '#1a5e60',
    fontStyle: 'italic',
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default Certificate;
