import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { Layout, Text, Card, Button, Spinner } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { api } from '../services/API';

export default function AnalyticsScreen({ navigation }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('week'); // week, month

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await axios.get(`${api}/analytics/user?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#00E096';
    if (score >= 60) return '#FFAA00';
    return '#FF3D71';
  };

  if (loading && !analytics) {
    return (
      <Layout style={styles.container}>
        <View style={styles.centerContainer}>
          <Spinner size="giant" />
          <Text style={styles.loadingText}>Loading Analytics...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <Button
            size="small"
            appearance={period === 'week' ? 'filled' : 'outline'}
            onPress={() => setPeriod('week')}
            style={styles.periodButton}
          >
            This Week
          </Button>
          <Button
            size="small"
            appearance={period === 'month' ? 'filled' : 'outline'}
            onPress={() => setPeriod('month')}
            style={styles.periodButton}
          >
            This Month
          </Button>
        </View>

        {analytics && (
          <>
            {/* Health Score Card */}
            <Card style={styles.card}>
              <Text category="h6" style={styles.cardTitle}>Work-Life Balance Score</Text>
              <View style={styles.healthScoreContainer}>
                <View style={styles.scoreCircle}>
                  <Text
                    style={[
                      styles.scoreText,
                      { color: getHealthScoreColor(analytics.healthScore) }
                    ]}
                  >
                    {analytics.healthScore}
                  </Text>
                  <Text style={styles.scoreLabel}>/ 100</Text>
                </View>
              </View>
            </Card>

            {/* Summary Stats */}
            <Card style={styles.card}>
              <Text category="h6" style={styles.cardTitle}>Summary Statistics</Text>

              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{analytics.totalHours}h</Text>
                  <Text style={styles.statLabel}>Total Hours</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{analytics.totalDaysWorked}</Text>
                  <Text style={styles.statLabel}>Days Worked</Text>
                </View>
              </View>

              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{analytics.averageHoursPerDay}h</Text>
                  <Text style={styles.statLabel}>Avg Hours/Day</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{analytics.overtimeHours}h</Text>
                  <Text style={styles.statLabel}>Overtime</Text>
                </View>
              </View>
            </Card>

            {/* Work Patterns */}
            {analytics.longestDay && (
              <Card style={styles.card}>
                <Text category="h6" style={styles.cardTitle}>Work Patterns</Text>

                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Average Arrival Time</Text>
                  <Text style={styles.patternValue}>{analytics.averageArrivalTime}</Text>
                </View>

                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Longest Day</Text>
                  <Text style={styles.patternValue}>
                    {analytics.longestDay.hours}h on {analytics.longestDay.date}
                  </Text>
                </View>

                {analytics.shortestDay && (
                  <View style={styles.patternItem}>
                    <Text style={styles.patternLabel}>Shortest Day</Text>
                    <Text style={styles.patternValue}>
                      {analytics.shortestDay.hours}h on {analytics.shortestDay.date}
                    </Text>
                  </View>
                )}
              </Card>
            )}

            {/* Suggestions */}
            <Card style={styles.card}>
              <Text category="h6" style={styles.cardTitle}>Recommendations</Text>
              {analytics.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>• {suggestion}</Text>
                </View>
              ))}
            </Card>

            {/* Daily Breakdown */}
            {analytics.workPattern && analytics.workPattern.length > 0 && (
              <Card style={styles.card}>
                <Text category="h6" style={styles.cardTitle}>Daily Hours Breakdown</Text>
                {analytics.workPattern.map((day, index) => (
                  <View key={index} style={styles.dayRow}>
                    <Text style={styles.dayDate}>{day.date}</Text>
                    <View style={styles.hoursBar}>
                      <View
                        style={[
                          styles.hoursBarFill,
                          {
                            width: `${Math.min((day.hours / 12) * 100, 100)}%`,
                            backgroundColor: day.hours > 9 ? '#FFAA00' : '#00E096'
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.dayHours}>{day.hours}h</Text>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222B45'
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    color: '#8F9BB3'
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12
  },
  periodButton: {
    flex: 1
  },
  card: {
    backgroundColor: '#1A2138',
    marginBottom: 16,
    borderRadius: 12
  },
  cardTitle: {
    color: '#FFFFFF',
    marginBottom: 16,
    fontWeight: 'bold'
  },
  healthScoreContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#2E3A59',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold'
  },
  scoreLabel: {
    fontSize: 14,
    color: '#8F9BB3',
    marginTop: 4
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  statLabel: {
    fontSize: 12,
    color: '#8F9BB3',
    marginTop: 4
  },
  patternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3A59'
  },
  patternLabel: {
    color: '#8F9BB3',
    fontSize: 14
  },
  patternValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  },
  suggestionItem: {
    paddingVertical: 8
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12
  },
  dayDate: {
    color: '#8F9BB3',
    fontSize: 12,
    width: 80
  },
  hoursBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#2E3A59',
    borderRadius: 4,
    overflow: 'hidden'
  },
  hoursBarFill: {
    height: '100%',
    borderRadius: 4
  },
  dayHours: {
    color: '#FFFFFF',
    fontSize: 12,
    width: 40,
    textAlign: 'right'
  }
});
