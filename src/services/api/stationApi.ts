import { http } from '../http';

// 电站相关接口类型定义
export interface StationDTO {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  userId: number;
  createTime?: string;
  updateTime?: string;
}

export interface StationCreateDTO {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface StationUpdateDTO {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface StationStatisticsDTO {
  totalPower: number;
  totalEnergy: number;
  totalIncome: number;
  deviceCount: number;
  onlineCount: number;
  offlineCount: number;
  alertCount: number;
}

// API 接口定义
export const stationApi = {
  // 创建电站
  createStation: (data: StationCreateDTO) => {
    return http.post<StationDTO>('/v1/biz/stations', data);
  },

  // 获取电站详情
  getStation: (id: number) => {
    return http.get<StationDTO>(`/v1/biz/stations/${id}`);
  },

  // 获取用户的所有电站
  getUserStations: () => {
    return http.get<StationDTO[]>('/v1/biz/stations');
  },

  // 更新电站信息
  updateStation: (id: number, data: StationUpdateDTO) => {
    return http.put<StationDTO>(`/v1/biz/stations/${id}`, data);
  },

  // 删除电站
  deleteStation: (id: number) => {
    return http.delete<boolean>(`/v1/biz/stations/${id}`);
  },

  // 获取电站统计数据
  getStationStatistics: (id: number) => {
    return http.get<StationStatisticsDTO>(`/v1/biz/stations/${id}/statistics`);
  }
}; 