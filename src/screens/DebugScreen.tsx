import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Clipboard, Switch } from 'react-native';
import { logger, LogEntry } from '../utils/logger';
import { getUsageStats } from '../utils/analytics';
import { featureFlags } from '../utils/featureFlags';
import { ArrowLeft, Trash2, Copy, Activity, FileText, Flag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

type Tab = 'LOGS' | 'STATS' | 'FLAGS';

export const DebugScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>('LOGS');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [flags, setFlags] = useState<any>({});

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000); // Auto refresh
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLogs([...logger.getLogs()]);
    const usage = await getUsageStats();
    setStats(usage);
    setFlags(featureFlags.getAll());
  };

  const toggleFlag = async (key: string) => {
      const newValue = !flags[key];
      await featureFlags.setFlag(key as any, newValue);
      setFlags(featureFlags.getAll());
  };

  const handleClear = () => {
      logger.clear();
      setLogs([]);
  };

  const handleCopy = () => {
      const content = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message} ${JSON.stringify(l.data || '')}`).join('\n');
      Clipboard.setString(content);
  };

  const renderLogItem = ({ item }: { item: LogEntry }) => {
      const color = item.level === 'ERROR' ? '#FF5252' : item.level === 'WARN' ? '#FFC107' : '#4CAF50';
      return (
          <View style={styles.logItem}>
              <View style={styles.logHeader}>
                  <Text style={[styles.logLevel, { color }]}>{item.level}</Text>
                  <Text style={styles.logTime}>{item.timestamp.split('T')[1].slice(0, 8)}</Text>
              </View>
              <Text style={styles.logMessage}>{item.message}</Text>
              {item.data && (
                  <Text style={styles.logData}>{JSON.stringify(item.data)}</Text>
              )}
          </View>
      );
  };

  const renderStatsItem = ({ item }: { item: any }) => (
      <View style={styles.statItem}>
          <Text style={styles.statDate}>{item.date}</Text>
          {Object.entries(item.events).map(([key, value]) => (
              <View key={key} style={styles.statRow}>
                  <Text style={styles.statLabel}>{key}</Text>
                  <Text style={styles.statValue}>{String(value)}</Text>
              </View>
          ))}
      </View>
  );

  const renderFlagItem = ({ item }: { item: string }) => (
      <View style={styles.statItem}>
          <View style={styles.statRow}>
              <Text style={styles.statLabel}>{item}</Text>
              <Switch 
                value={flags[item]} 
                onValueChange={() => toggleFlag(item)} 
              />
          </View>
      </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Debug Console</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'LOGS' && styles.activeTab]} 
            onPress={() => setActiveTab('LOGS')}
          >
              <FileText size={16} color={activeTab === 'LOGS' ? '#4A00E0' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'LOGS' && styles.activeTabText]}>Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'STATS' && styles.activeTab]} 
            onPress={() => setActiveTab('STATS')}
          >
              <Activity size={16} color={activeTab === 'STATS' ? '#4A00E0' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'STATS' && styles.activeTabText]}>Stats</Text>
          </TouchableOpacity>
           <TouchableOpacity 
            style={[styles.tab, activeTab === 'FLAGS' && styles.activeTab]} 
            onPress={() => setActiveTab('FLAGS')}
          >
              <Flag size={16} color={activeTab === 'FLAGS' ? '#4A00E0' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'FLAGS' && styles.activeTabText]}>Flags</Text>
          </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
          {activeTab === 'LOGS' ? (
              <FlatList
                data={logs}
                renderItem={renderLogItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.list}
              />
          ) : activeTab === 'STATS' ? (
              <FlatList
                data={stats}
                renderItem={renderStatsItem}
                keyExtractor={(item) => item.date}
                contentContainerStyle={styles.list}
              />
          ) : (
              <FlatList
                data={Object.keys(flags)}
                renderItem={renderFlagItem}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.list}
              />
          )}
      </View>

      {/* Footer Actions (Logs) */}
      {activeTab === 'LOGS' && (
          <View style={styles.footer}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                  <Copy size={20} color="#333" />
                  <Text style={styles.actionText}>Kopyala</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleClear}>
                  <Trash2 size={20} color="#FF5252" />
                  <Text style={[styles.actionText, { color: '#FF5252' }]}>Temizle</Text>
              </TouchableOpacity>
          </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  backBtn: {
      padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabs: {
      flexDirection: 'row',
      backgroundColor: 'white',
      padding: 4,
      margin: 16,
      borderRadius: 12,
  },
  tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      gap: 8,
      borderRadius: 10,
  },
  activeTab: {
      backgroundColor: '#F0E6FF',
  },
  tabText: {
      fontWeight: '600',
      color: '#666',
  },
  activeTabText: {
      color: '#4A00E0',
  },
  content: {
      flex: 1,
  },
  list: {
      padding: 16,
      paddingBottom: 80,
  },
  logItem: {
      backgroundColor: 'white',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#ddd',
  },
  logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
  },
  logLevel: {
      fontSize: 10,
      fontWeight: 'bold',
  },
  logTime: {
      fontSize: 10,
      color: '#999',
      fontFamily: 'monospace',
  },
  logMessage: {
      fontSize: 13,
      color: '#333',
  },
  logData: {
      fontSize: 10,
      color: '#666',
      marginTop: 4,
      fontFamily: 'monospace',
      backgroundColor: '#f0f0f0',
      padding: 4,
      borderRadius: 4,
  },
  footer: {
      flexDirection: 'row',
      backgroundColor: 'white',
      padding: 16,
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: '#eee',
  },
  actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 8,
  },
  actionText: {
      fontWeight: '600',
  },
  statItem: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
  },
  statDate: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#333',
  },
  statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
  },
  statLabel: {
      color: '#666',
      fontSize: 14,
  },
  statValue: {
      fontWeight: 'bold',
      fontSize: 14,
  },
});
