import {http} from '../http';

// 设备相关接口类型定义
export interface UserEquipmentDTO {
  id?: number;
  name: string;
  sn: string;
  image?: string;
  stationId?: number;
  userId?: number;
  email?: string;
  categoryId?: number;
  categoryName?: string;
  seriesId?: number;
  seriesName?: string;
  modelId?: number;
  modelName?: string;
  status?: number;
}

export interface EquipSetCommand {
  sn?: string;
  cmdType: string;
  value: string;
}

export interface AppPvTimeIndicatorDTO {
  power: PVTimeIndicatorDTO[];
  voltage: PVTimeIndicatorDTO[];
  current: PVTimeIndicatorDTO[];
}

export interface PVTimeIndicatorDTO {
  time: string;
  pv1Indicator?: number;
  pv2Indicator?: number;
  pv3Indicator?: number;
  pv4Indicator?: number;
}

export interface InverterFirstPageDTO {
  state: InverterStateDTO;
  pvPower: PvPowerDTO;
  out: OutDTO;
  powerGen: PowerGenDTO;
}

export interface InverterStateDTO {
  state: number;
  alertNums: number;
  equipType: string;
  lastTime: string;
}

export interface OutDTO {
  powerTotal: number;
  voltage: number;
  current: number;
}

export interface PowerGenDTO {
  genTotal: number;
  genDay: number;
}

export interface PvPowerDTO {
  powerTotal: number;
  powerPv1: number;
  powerPv2: number;
  powerPv3: number;
  powerPv4: number;
}

export interface EquipTimeIndicatorDTO {
  time: string;
  power: number;
  voltage: number;
  current: number;
}

export interface GenEleDTO {
  time: string;
  powerGen: number;
}

export interface GenEleQueryParams {
  stationId?: number;
  startTime?: string;
  endTime?: string;
  grain?: number; // 粒度：月-1，年-2，总-3
}

export interface AppEquipmentDTO {
  id: number;
  name: string;
  sn: string;
  image?: string;
}

export interface StationDTO {
  equipments: AppEquipmentDTO[];
}

// API 接口定义
export const deviceApi = {
  /**
   * 创建用户设备
   * POST /v1/biz/equipments
   */
  createUserEquipment: (data: UserEquipmentDTO) => {
    return http.post<UserEquipmentDTO>('/biz/v1/biz/equipments', data);
  },

  /**
   * 获取用户设备详情
   * GET /v1/biz/equipments/{id}
   */
  getUserEquipment: (id: number) => {
    return http.get<UserEquipmentDTO>(`/biz/v1/biz/equipments/${id}`);
  },

  /**
   * 根据电站ID查询用户设备
   * GET /v1/biz/equipments/station/{stationId}
   */
  getUserEquipmentsByStation: (stationId: number) => {
    return http.get<UserEquipmentDTO[]>(
      `/biz/v1/biz/equipments/station/${stationId}`,
    );
  },

  /**
   * 设置设备配置
   * PUT /v1/biz/equipments/equip/set/{sn}
   */
  setEquipmentParams: (sn: string, data: EquipSetCommand) => {
    return http.put<boolean>(`/biz/v1/biz/equipments/equip/set/${sn}`, data);
  },

  /**
   * 查询逆变器设备的PV时间数据
   * GET /v1/biz/equipments/pv/time/{id}
   */
  getPvTimeIndicator: (id: number) => {
    return http.get<AppPvTimeIndicatorDTO>(
      `/biz/v1/biz/equipments/pv/time/${id}`,
    );
  },

  /**
   * 查询逆变器设备的首页数据
   * GET /v1/biz/equipments/first/{id}
   */
  getInverterFirstPage: (id: number) => {
    return http.get<InverterFirstPageDTO>(`/biz/v1/biz/equipments/first/${id}`);
  },

  /**
   * 查询逆变器设备时间数据
   * GET /v1/biz/equipments/equip/time/{id}
   */
  getEquipTimeIndicator: (id: number) => {
    return http.get<EquipTimeIndicatorDTO[]>(
      `/biz/v1/biz/equipments/equip/time/${id}`,
    );
  },

  /**
   * 查询电站的发电量统计数据
   * GET /v1/biz/station/gen/{id}
   */
  queryGenEle: (id: number, params?: GenEleQueryParams) => {
    return http.get<GenEleDTO[]>(`/biz/v1/biz/station/gen/${id}`, params);
  },

  /**
   * 获取电站用户设备列表数据
   * GET /v1/biz/station/equip/{id}
   */
  getStationEquipment: (id: number) => {
    return http.get<StationDTO>(`/biz/v1/biz/station/equip/${id}`);
  },
  checkSNCode: (id: string) => {
    return http.get<boolean>(`/biz/v1/biz/equipments/check?sn=${id}`);
  },

  /**
   * 添加设备（使用创建用户设备接口）
   * POST /v1/biz/equipments
   */
  addDevice: (params: {sn: string; name: string}) => {
    return http.post<UserEquipmentDTO>('/biz/v1/biz/equipments', {
      sn: params.sn,
      name: params.name,
    });
  },
  unbindDevice: (id: number | string) => {
    return http.put<UserEquipmentDTO>('/biz/v1/biz/equipments/unbind/' + id);
  },
};
