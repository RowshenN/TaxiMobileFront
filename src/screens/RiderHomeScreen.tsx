import { useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Alert,
  PanResponder, LayoutAnimation, useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SearchModal, { Place } from './SearchModal';

// The rider's current location (fake for now, the map will give the real one later)
const ME: Place = { id: 'me', name: '58, Görogly (2009) köçesi', address: '', distance: '' };

// Fake prices, the backend will calculate real ones later
const CATEGORIES = [
  { id: 'ekonom', name: 'Ekonom', price: 15 },
  { id: 'standart', name: 'Standart', price: 20 },
  { id: 'comfort', name: 'Comfort', price: 25 },
  { id: 'vip', name: 'VIP', price: 40 },
  { id: 'kuryer', name: 'Kuryer', price: 18 },
  { id: 'sienna', name: 'Sienna', price: 35 },
  { id: 'premium', name: 'Premium', price: 60 },
];

export default function RiderHomeScreen() {
  const { height } = useWindowDimensions();

  const [mode, setMode] = useState<'pick' | 'order'>('pick');
  const [stops, setStops] = useState<(Place | null)[]>([ME, null]);
  const [searchIndex, setSearchIndex] = useState<number | null>(null);
  const [category, setCategory] = useState('standart');
  const [collapsed, setCollapsed] = useState(false);

  const chosen = CATEGORIES.find((c) => c.id === category)!;
  const allFilled = stops.every((s) => s !== null);

  // ----- Bottom block: collapse / expand -----
  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const setCollapsedAnimated = (value: boolean) => {
    animate();
    setCollapsed(value);
  };

  // Handle area: swipe up = open, swipe down = close, tap = switch
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, g) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (g.dy < -15) setCollapsed(false);
        else if (g.dy > 15) setCollapsed(true);
        else if (Math.abs(g.dx) < 10 && Math.abs(g.dy) < 10) setCollapsed((c) => !c);
      },
    })
  ).current;

  // ----- Points (stops) -----
  const removeStop = (index: number) => {
    if (stops.length > 2) {
      // 3 or more points: remove the row completely
      setStops(stops.filter((_, i) => i !== index));
    } else {
      // only 2 points: keep the row but clear the address
      setStops(stops.map((s, i) => (i === index ? null : s)));
    }
  };

  const addStop = () => {
    if (stops.length < 5) setStops([...stops, null]);
  };

  const selectPlace = (place: Place) => {
    if (searchIndex === null) return;
    setStops(stops.map((s, i) => (i === searchIndex ? place : s)));
    setSearchIndex(null);
  };

  const goBack = () => {
    if (mode === 'order') setMode('pick');
  };

  const sendOrder = () => {
    Alert.alert('Sargyt', `${chosen.name} - ${chosen.price.toFixed(2)} TMT (fake order)`);
  };

  const collapsedText =
    mode === 'order'
      ? `${chosen.name} · ${chosen.price.toFixed(2)} TMT`
      : stops[1]?.name ?? 'Nirä gitmeli?';

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </Pressable>
        <Text style={styles.title}>Taksi</Text>
        <MaterialCommunityIcons name="steering" size={26} color="#111" style={styles.topIcon} />
        <Ionicons name="settings-outline" size={24} color="#111" />
      </View>

      {/* Map area (placeholder for now). Tapping the map collapses the bottom block */}
      <Pressable style={styles.map} onPress={() => setCollapsedAnimated(true)}>
        <Text style={styles.mapText}>{mode === 'order' ? 'Route will be here' : 'Map will be here'}</Text>

        <Pressable style={[styles.roundButton, styles.leftButton]}>
          <Ionicons name="call-outline" size={24} color="#111" />
        </Pressable>
        <Pressable style={[styles.roundButton, styles.rightTopButton]}>
          <Text style={styles.threeD}>3D</Text>
        </Pressable>
        <Pressable style={[styles.roundButton, styles.rightBottomButton]}>
          <Ionicons name="navigate-outline" size={24} color="#4A5BE8" />
        </Pressable>
      </Pressable>

      {/* Bottom block */}
      <View style={styles.sheet}>
        {/* Handle area: tap or swipe here */}
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handle} />
          {collapsed ? (
            <View style={styles.collapsedRow}>
              <Ionicons name="chevron-up" size={22} color="#4A5BE8" />
              <Text style={styles.collapsedText} numberOfLines={1}>{collapsedText}</Text>
            </View>
          ) : mode === 'pick' ? (
            <Text style={styles.sheetTitle}>Sargyt</Text>
          ) : null}
        </View>

        {!collapsed && (
          <ScrollView
            style={{ maxHeight: height * 0.6 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {mode === 'pick' ? (
              <>
                {/* From */}
                <Pressable style={styles.inputRow} onPress={() => setSearchIndex(0)}>
                  <Ionicons name="location" size={22} color="#2F80ED" />
                  <Text style={[styles.inputText, !stops[0] && styles.placeholderText]} numberOfLines={1}>
                    {stops[0]?.name ?? 'Nireden?'}
                  </Text>
                  <Text style={styles.mapLink}>Karta</Text>
                </Pressable>

                {/* To */}
                <Pressable style={styles.inputRow} onPress={() => setSearchIndex(1)}>
                  <Ionicons name="flag" size={22} color="#111" />
                  <Text style={[styles.inputText, !stops[1] && styles.placeholderText]} numberOfLines={1}>
                    {stops[1]?.name ?? 'Nirä gitmeli?'}
                  </Text>
                  <Text style={styles.mapLink}>Karta</Text>
                </Pressable>

                <Pressable
                  style={[styles.mainButton, !(stops[0] && stops[1]) && styles.disabled]}
                  disabled={!(stops[0] && stops[1])}
                  onPress={() => setMode('order')}
                >
                  <Text style={styles.mainButtonText}>Dowam et</Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* Points list */}
                {stops.map((stop, index) => (
                  <View key={index} style={styles.stopRow}>
                    <Pressable onPress={() => removeStop(index)} hitSlop={8}>
                      <Ionicons name="remove-circle-outline" size={28} color="#6B7280" />
                    </Pressable>

                    <Pressable
                      style={[styles.inputRow, styles.stopInput]}
                      onPress={() => setSearchIndex(index)}
                    >
                      <View style={styles.numberCircle}>
                        <Text style={styles.numberText}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.inputText, !stop && styles.placeholderText]} numberOfLines={1}>
                        {stop?.name ?? 'Nirä gitmeli?'}
                      </Text>
                      <Text style={styles.mapLink}>Karta</Text>
                    </Pressable>

                    {index === stops.length - 1 && stops.length < 5 ? (
                      <Pressable style={styles.plusButton} onPress={addStop}>
                        <Ionicons name="add" size={24} color="#fff" />
                      </Pressable>
                    ) : null}
                  </View>
                ))}

                {/* Price cards */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.cards}
                >
                  {CATEGORIES.map((c) => {
                    const selected = c.id === category;
                    return (
                      <Pressable
                        key={c.id}
                        style={[styles.card, selected && styles.cardSelected]}
                        onPress={() => setCategory(c.id)}
                      >
                        <Ionicons name="car-sport" size={34} color={selected ? '#2F6FED' : '#9CA3AF'} />
                        <Text style={[styles.cardName, selected && styles.cardTextSelected]}>{c.name}</Text>
                        <Text style={[styles.cardPrice, selected && styles.cardTextSelected]}>
                          {c.price.toFixed(2)} TMT
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Comment row */}
                <Pressable style={styles.inputRow}>
                  <Ionicons name="chatbox-outline" size={22} color="#2F6FED" />
                  <Text style={[styles.inputText, styles.bigText]}>Teswir</Text>
                  <Ionicons name="chevron-forward" size={20} color="#111" />
                </Pressable>

                {/* Order time row */}
                <Pressable style={styles.inputRow}>
                  <Ionicons name="calendar-outline" size={22} color="#2F6FED" />
                  <Text style={[styles.inputText, styles.bigText]}>Sargydyň wagty</Text>
                  <Text style={styles.mapLink}>Şuwagt</Text>
                  <Ionicons name="chevron-forward" size={20} color="#111" />
                </Pressable>

                <Pressable
                  style={[styles.mainButton, !allFilled && styles.disabled]}
                  disabled={!allFilled}
                  onPress={sendOrder}
                >
                  <Text style={styles.mainButtonText}>Sargyt et</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        )}
      </View>

      {/* Search screen */}
      <SearchModal
        visible={searchIndex !== null}
        onClose={() => setSearchIndex(null)}
        onSelect={selectPlace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight ?? 0) + 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 44, height: 44, borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 24, fontWeight: '700', marginLeft: 16, color: '#111' },
  topIcon: { marginRight: 18 },

  map: { flex: 1, backgroundColor: '#E8E4DC', alignItems: 'center', justifyContent: 'center' },
  mapText: { color: '#777', fontSize: 16 },
  roundButton: {
    position: 'absolute', width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    elevation: 4,
  },
  leftButton: { left: 16, bottom: 90 },
  rightTopButton: { right: 16, bottom: 90 },
  rightBottomButton: { right: 16, bottom: 20 },
  threeD: { fontSize: 18, fontWeight: '700', color: '#2D3A5C' },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 16, paddingBottom: 24,
    marginTop: -24,
  },
  dragArea: { paddingTop: 10, paddingBottom: 8 },
  handle: {
    width: 48, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB',
    alignSelf: 'center', marginBottom: 10,
  },
  sheetTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', color: '#111' },
  collapsedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  collapsedText: { fontSize: 17, fontWeight: '600', color: '#111', marginLeft: 8, flexShrink: 1 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F6FA', borderRadius: 16,
    paddingHorizontal: 16, height: 60, marginBottom: 12,
  },
  inputText: { flex: 1, marginLeft: 12, fontSize: 16, color: '#111' },
  bigText: { fontSize: 18 },
  placeholderText: { color: '#8A94A6' },
  mapLink: { color: '#8A94A6', fontSize: 16, marginLeft: 8, marginRight: 4 },

  stopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stopInput: { flex: 1, marginLeft: 8, marginBottom: 0 },
  numberCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#4A5BE8',
    alignItems: 'center', justifyContent: 'center',
  },
  numberText: { color: '#fff', fontWeight: '700' },
  plusButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#2F80ED',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
    },

  cards: { marginTop: 4, marginBottom: 14, flexGrow: 0 },
  card: {
    width: 130, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 12, marginRight: 10, backgroundColor: '#fff',
  },
  cardSelected: { borderColor: '#2F6FED', backgroundColor: '#EEF4FF', borderWidth: 1.5 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 6 },
  cardPrice: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 2 },
  cardTextSelected: { color: '#2F6FED' },

  mainButton: {
    backgroundColor: '#4A5BE8', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  mainButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  disabled: { opacity: 0.4 },
});