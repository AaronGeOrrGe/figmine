import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// Example template data, replace these with your actual images and data
const templates = [
  {
    id: 'flowchart',
    title: 'Flowchart Template',
    author: 'Figmine',
    date: 'Today',
    category: 'Diagram',
    image: require('../../assets/images/thumbnail4.png'),
    isFlowchart: true
  },
  {
    id: '1',
    title: 'Crypto UI',
    author: 'Edho Pratama',
    date: '13/01/2024',
    category: 'Landing',
    image: require('../../assets/images/inspiration.png')
  },
  {
    id: '2',
    title: 'Food App UI',
    author: 'Edho Pratama',
    date: '13/01/2024',
    category: 'Finance',
    image: require('../../assets/images/inspiration2.png')
  },
  {
    id: '3',
    title: 'Bolt UI',
    author: 'Balázs Kétyi',
    date: '14/01/2024',
    category: 'Landing',
    image: require('../../assets/images/inspiration3.png')
  },
  {
    id: '4',
    title: 'Shopping UI',
    author: 'Edho Pratama',
    date: '13/01/2024',
    category: 'Social',
    image: require('../../assets/images/inspiration4.png')
  },
];

export default function TemplatesScreen() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const filteredTemplates = templates.filter(tpl => tpl.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wireframes</Text>
      <Text style={styles.subtitle}>Discover amazing design templates</Text>
      <TextInput
        style={styles.search}
        placeholder="Search wireframes..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.grid}>
        {filteredTemplates.map((tpl) => (
          <TouchableOpacity
            key={tpl.id}
            style={[styles.card, tpl.isFlowchart && { borderColor: '#4F8EF7', borderWidth: 2, backgroundColor: '#E3F0FF' }]}
            onPress={() => {
              if (tpl.isFlowchart) {
                router.push({ pathname: '/mirror', params: { fromFlowchart: '1' } });
              } else {
                router.push({ pathname: '/template-details', params: { id: tpl.id } });
              }
            }}
          >
            <Image source={tpl.image} style={styles.image} resizeMode="cover" />
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, tpl.isFlowchart && { color: '#3478F6' }]}>{tpl.title}</Text>
              <Text style={styles.cardAuthor}>by {tpl.author}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>{tpl.date}</Text>
                <View style={[styles.badge, tpl.isFlowchart ? {backgroundColor: '#B6D8FF'} : {backgroundColor: '#E6F0FF'}]}>
                  <Text style={styles.badgeText}>{tpl.category}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 2 },
  subtitle: { fontSize: 15, color: '#888', marginBottom: 20 },
  search: { height: 40, borderRadius: 10, backgroundColor: '#F0F0F0', paddingHorizontal: 14, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 16, marginBottom: 18, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: {width: 0, height: 2} },
  image: { width: '100%', height: 60, borderRadius: 8 },
  cardContent: { padding: 10 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardAuthor: { fontSize: 12, color: '#888', marginBottom: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDate: { fontSize: 11, color: '#aaa' },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 6 },
  badgeText: { fontSize: 11, color: '#3478F6', fontWeight: '500' },
});
