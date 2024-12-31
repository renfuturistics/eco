import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeProps = {
  type: string;
};

const Badge = ({ type }: BadgeProps) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{type}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1, // Add border width
    borderColor: '#3B82F6', // Set border color
    borderRadius: 1, // Rounded corners
    paddingVertical: 6, // Padding for height
    paddingHorizontal: 20, // Padding for width
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth:100,
    width: 'auto', // Let the width be defined by the text content
  },
  badgeText: {
    fontSize: 12, // Text size for the badge
    fontWeight: 'bold',
    color: '#3B82F6', // Text color to match the border
  },
});

export default Badge;
