export interface Member {
  id: string;
  name: string;
  department: string;
  attending: boolean;
  email?: string;
}

export interface Group {
  id: string;
  members: Member[];
}

export interface PairHistory {
  date: string;
  groups: Group[];
}

export interface AppSettings {
  targetGroupSize: number;
}
