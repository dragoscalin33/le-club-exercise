import { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import apiClient from '../api/client'
import type { Restaurant, RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>

export default function RestaurantDetailScreen({ route, navigation }: Props) {
  const { id } = route.params
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient
      .get<Restaurant>(`/restaurants/${id}`)
      .then((res) => setRestaurant(res.data))
      .catch(() => setError('Failed to load restaurant'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    )
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error || 'Restaurant not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
        <Text style={styles.backArrow}>← Back</Text>
      </TouchableOpacity>

      <ScrollView>
        {restaurant.photoUrl ? (
          <Image source={{ uri: restaurant.photoUrl }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.noPhoto]}>
            <Text style={styles.noPhotoText}>No photo available</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.name}>{restaurant.name}</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{restaurant.address}</Text>
          </View>

          {restaurant.description ? (
            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{restaurant.description}</Text>
            </View>
          ) : null}

          {restaurant.createdBy ? (
            <View style={styles.section}>
              <Text style={styles.label}>Added by</Text>
              <Text style={styles.value}>{restaurant.createdBy.email}</Text>
            </View>
          ) : null}

          <Text style={styles.date}>
            Added {new Date(restaurant.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  backRow: { padding: 16, paddingBottom: 0 },
  backArrow: { color: '#555', fontSize: 15 },
  photo: { width: '100%', height: 240 },
  noPhoto: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: { color: '#aaa', fontSize: 14 },
  body: { padding: 20 },
  name: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 20 },
  section: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  value: { fontSize: 16, color: '#333', lineHeight: 22 },
  date: { fontSize: 12, color: '#bbb', marginTop: 24 },
  error: { color: '#e74c3c', fontSize: 16, marginBottom: 16 },
  backBtn: { borderWidth: 1, borderColor: '#111', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnText: { fontSize: 14, color: '#111' },
})
