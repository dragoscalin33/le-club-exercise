import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import apiClient from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import type { Restaurant, RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantList'>

export default function RestaurantListScreen({ navigation }: Props) {
  const { user, logout } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await apiClient.get<Restaurant[]>('/restaurants')
      setRestaurants(res.data)
      setError('')
    } catch {
      setError('Failed to load restaurants')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchRestaurants() }, [fetchRestaurants])

  const onRefresh = () => {
    setRefreshing(true)
    fetchRestaurants()
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurants</Text>
        <View style={styles.headerRight}>
          <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={restaurants}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No restaurants yet.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RestaurantDetail', { id: item.id })}
            activeOpacity={0.7}
          >
            {item.photoUrl ? (
              <Image source={{ uri: item.photoUrl }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.noPhoto]}>
                <Text style={styles.noPhotoText}>No photo</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    padding: 16,
    paddingTop: 12,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' },
  email: { color: '#aaa', fontSize: 12, maxWidth: 120 },
  logoutBtn: { borderWidth: 1, borderColor: '#fff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  logoutText: { color: '#fff', fontSize: 12 },
  error: { color: '#e74c3c', padding: 16, textAlign: 'center' },
  list: { padding: 12, gap: 12 },
  empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  photo: { width: 90, height: 90 },
  noPhoto: { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  noPhotoText: { color: '#aaa', fontSize: 11 },
  info: { flex: 1, padding: 12, justifyContent: 'center', gap: 4 },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  address: { fontSize: 13, color: '#666', lineHeight: 18 },
})
