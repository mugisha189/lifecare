import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
});
