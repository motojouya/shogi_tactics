export type Status = {
  key: string;
  name: string;
  description: string;
};

// step15(S4): repositoryのstatus memory getをmodelへ渡すためのresolver型。
export type GetStatus = (key: string) => Status | null;
