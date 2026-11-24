import { useState } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, FlatList, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Place = { id: string; name: string; address: string; distance: string };

const FAKE_PLACES: Place[] = [
  { id: '1', name: 'Magtymguly adyndaky Türkmen döwlet muzeýi', address: 'Görogly (2009) köçesi, Köpetdag etraby, Ashgabat', distance: '940 m' },
  { id: '2', name: 'Magtymguly binasy', address: 'Bagtyýarlyk etraby, Ashgabat', distance: '1.0 km' },
  { id: '3', name: '115, Magtymguly (2033) şaýoly', address: 'Köpetdag etraby, Ashgabat', distance: '920 m' },
  { id: '4', name: '79, Magtymguly (2033) şaýoly', address: 'Berkararlyk etraby, Ashgabat', distance: '1.4 km' },
  { id: '5', name: 'Magtymguly ýadygärligi', address: 'Büzmeýin etraby, Ashgabat', distance: '13 km' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (place: Place) => void;
};

export default function SearchModal({ visible, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const results = FAKE_PLACES.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Salgy gözle</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={30} color="#111" />
          </Pressable>
        </View>

        {/* Search box */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color="#4A5BE8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Salgy ýa-da ýer ady"
            placeholderTextColor="#8A94A6"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        {/* Two buttons */}
        <View style={styles.buttonsRow}>
          <Pressable style={styles.smallButton}>
            <Text style={styles.smallButtonText}>Kartadan saýla</Text>
          </Pressable>
          <Pressable style={styles.smallButton}>
            <Text style={styles.smallButtonText}>Duran ýerimi saýla</Text>
          </Pressable>
        </View>

        {/* Results */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => {
                onSelect(item);
                setQuery('');
              }}
            >
              <View style={styles.pinBox}>
                <Ionicons name="location-outline" size={24} color="#4A5BE8" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
              </View>
              <Text style={styles.distance}>{item.distance}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: (StatusBar.currentHeight ?? 0) + 12, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F6FA', borderRadius: 16, paddingHorizontal: 16, height: 60,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 18, color: '#111' },
  buttonsRow: { flexDirection: 'row', gap: 12, marginVertical: 16 },
  smallButton: {
    flex: 1, backgroundColor: '#F5F6FA', borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  smallButtonText: { color: '#2F6FED', fontSize: 16, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  pinBox: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#F5F6FA',
    alignItems: 'center', justifyContent: 'center',
  },
  rowText: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 17, fontWeight: '700', color: '#111' },
  address: { fontSize: 15, color: '#6B7280', marginTop: 2 },
  distance: { fontSize: 15, color: '#6B7280' },
});