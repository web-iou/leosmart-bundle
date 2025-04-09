import {Card, useTheme} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {ExtendedMD3Theme} from '@/theme';
import React from 'react';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

export default () => {
  const theme = useTheme() as ExtendedMD3Theme;
  
  return (
    <>
      {/* 设备状态卡片骨架屏 */}
      <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Card.Content>
          <View style={styles.statusSection}>
            <ShimmerPlaceHolder
              style={styles.skeletonTitle}
              LinearGradient={LinearGradient}
              visible={false}
            />
            <ShimmerPlaceHolder
              style={styles.skeletonStatus}
              LinearGradient={LinearGradient}
              visible={false}
            />
          </View>

          <View style={styles.deviceDetailSection}>
            <View style={styles.deviceImageContainer}>
              <ShimmerPlaceHolder
                style={styles.deviceImage}
                LinearGradient={LinearGradient}
                visible={false}
              />
            </View>

            <View style={styles.deviceInfoContainer}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <ShimmerPlaceHolder
                    style={styles.skeletonText}
                    LinearGradient={LinearGradient}
                    visible={false}
                  />
                  <ShimmerPlaceHolder
                    style={styles.skeletonLabel}
                    LinearGradient={LinearGradient}
                    visible={false}
                  />
                  <ShimmerPlaceHolder
                    style={styles.skeletonValue}
                    LinearGradient={LinearGradient}
                    visible={false}
                  />
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <ShimmerPlaceHolder
                    style={styles.skeletonLabel}
                    LinearGradient={LinearGradient}
                    visible={false}
                  />
                  <ShimmerPlaceHolder
                    style={styles.skeletonValue}
                    LinearGradient={LinearGradient}
                    visible={false}
                  />
                </View>
                <View style={styles.infoItem}>
                  <ShimmerPlaceHolder
                    style={styles.skeletonLabel}
                    LinearGradient={LinearGradient}
                    visible={false}
                  />
                  <ShimmerPlaceHolder
                    style={styles.skeletonValue}
                    LinearGradient={LinearGradient}
                    visible={false}
                  />
                </View>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 光伏功率骨架屏 */}
      <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Card.Content>
          <View style={styles.powerSection}>
            <View style={styles.powerHeader}>
              <View style={styles.powerTitleContainer}>
                <ShimmerPlaceHolder
                  style={styles.skeletonIcon}
                  LinearGradient={LinearGradient}
                  visible={false}
                />
                <ShimmerPlaceHolder
                  style={styles.skeletonTitle}
                  LinearGradient={LinearGradient}
                  visible={false}
                />
              </View>
              <ShimmerPlaceHolder
                style={styles.skeletonPowerValue}
                LinearGradient={LinearGradient}
                visible={false}
              />
            </View>

            <View style={styles.pvGrid}>
              {[1, 2, 3, 4].map((item) => (
                <ShimmerPlaceHolder
                  key={item}
                  style={styles.skeletonPvItem}
                  LinearGradient={LinearGradient}
                  visible={false}
                />
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 输出功率和今日发电量骨架屏 */}
      <View style={styles.rowContainer}>
        {/* 输出功率骨架屏 */}
        <Card style={[styles.halfCard, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <View style={styles.powerCardHeader}>
              <ShimmerPlaceHolder
                style={styles.skeletonIcon}
                LinearGradient={LinearGradient}
                visible={false}
              />
              <ShimmerPlaceHolder
                style={styles.skeletonSubtitle}
                LinearGradient={LinearGradient}
                visible={false}
              />
            </View>

            <ShimmerPlaceHolder
              style={styles.skeletonPowerValue}
              LinearGradient={LinearGradient}
              visible={false}
            />

            <View style={styles.powerDetailsRow}>
              <ShimmerPlaceHolder
                style={styles.skeletonDetail}
                LinearGradient={LinearGradient}
                visible={false}
              />
              <ShimmerPlaceHolder
                style={styles.skeletonDetail}
                LinearGradient={LinearGradient}
                visible={false}
              />
            </View>
          </Card.Content>
        </Card>

        {/* 今日发电量骨架屏 */}
        <Card style={[styles.halfCard, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <View style={styles.powerCardHeader}>
              <ShimmerPlaceHolder
                style={styles.skeletonIcon}
                LinearGradient={LinearGradient}
                visible={false}
              />
              <ShimmerPlaceHolder
                style={styles.skeletonSubtitle}
                LinearGradient={LinearGradient}
                visible={false}
              />
            </View>

            <ShimmerPlaceHolder
              style={styles.skeletonPowerValue}
              LinearGradient={LinearGradient}
              visible={false}
            />

            <View style={styles.powerDetailsRow}>
              <ShimmerPlaceHolder
                style={styles.skeletonDetail}
                LinearGradient={LinearGradient}
                visible={false}
              />
              <ShimmerPlaceHolder
                style={styles.skeletonDetail}
                LinearGradient={LinearGradient}
                visible={false}
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* 设备控制骨架屏 */}
      <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Card.Content>
          <View style={styles.controlHeader}>
            <View style={styles.controlTitleContainer}>
              <ShimmerPlaceHolder
                style={styles.skeletonControlIcon}
                LinearGradient={LinearGradient}
                visible={false}
              />
              <ShimmerPlaceHolder
                style={styles.skeletonTitle}
                LinearGradient={LinearGradient}
                visible={false}
              />
            </View>
            <ShimmerPlaceHolder
              style={styles.skeletonIcon}
              LinearGradient={LinearGradient}
              visible={false}
            />
          </View>

          <View style={styles.signalStatus}>
            <ShimmerPlaceHolder
              style={styles.skeletonSignalIcon}
              LinearGradient={LinearGradient}
              visible={false}
            />
            <ShimmerPlaceHolder
              style={styles.skeletonSignalText}
              LinearGradient={LinearGradient}
              visible={false}
            />
          </View>
        </Card.Content>
      </Card>

      {/* 告警信息骨架屏 */}
      <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Card.Content>
          <View style={styles.alertHeader}>
            <ShimmerPlaceHolder
              style={styles.skeletonIcon}
              LinearGradient={LinearGradient}
              visible={false}
            />
            <ShimmerPlaceHolder
              style={styles.skeletonTitle}
              LinearGradient={LinearGradient}
              visible={false}
            />
          </View>

          <View style={styles.systemMessage}>
            <ShimmerPlaceHolder
              style={styles.skeletonMessageIcon}
              LinearGradient={LinearGradient}
              visible={false}
            />
            <View style={styles.systemMessageContent}>
              <ShimmerPlaceHolder
                style={styles.skeletonMessageTitle}
                LinearGradient={LinearGradient}
                visible={false}
              />
              <ShimmerPlaceHolder
                style={styles.skeletonMessageText}
                LinearGradient={LinearGradient}
                visible={false}
              />
            </View>
            <ShimmerPlaceHolder
              style={styles.skeletonTime}
              LinearGradient={LinearGradient}
              visible={false}
            />
          </View>
        </Card.Content>
      </Card>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 1,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonTitle: {
    width: 100,
    height: 20,
    borderRadius: 4,
  },
  skeletonStatus: {
    width: 80,
    height: 20,
    borderRadius: 4,
  },
  deviceDetailSection: {
    flexDirection: 'row',
    marginTop: 16,
  },
  deviceImageContainer: {
    width: 100,
  },
  deviceImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  deviceInfoContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {},
  skeletonLabel: {
    width: 80,
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonValue: {
    width: 120,
    height: 20,
    borderRadius: 4,
  },
  skeletonText: {
    width: 150,
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  powerSection: {},
  powerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  powerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  skeletonPowerValue: {
    width: 100,
    height: 24,
    borderRadius: 4,
  },
  pvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonPvItem: {
    width: '48%',
    height: 80,
    borderRadius: 8,
    marginBottom: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  halfCard: {
    width: '48%',
    borderRadius: 12,
    elevation: 1,
    minHeight: 100,
  },
  powerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  powerDetailsRow: {
    marginTop: 8,
  },
  skeletonDetail: {
    width: 120,
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  controlTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonControlIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  signalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: 5,
    paddingBottom: 4,
    height: 30,
  },
  skeletonSignalIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 6,
  },
  skeletonSignalText: {
    width: 150,
    height: 18,
    borderRadius: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonMessageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  systemMessageContent: {
    flex: 1,
  },
  skeletonMessageTitle: {
    width: 100,
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonMessageText: {
    width: 200,
    height: 16,
    borderRadius: 4,
  },
  skeletonTime: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },
}); 