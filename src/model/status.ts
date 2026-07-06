export type Status = {
  key: string;
  name: string;
  description: string;
};

export type GetStatus = (key: string) => Status | null;
