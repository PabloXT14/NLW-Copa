export declare global {
  namespace ReactNavigation {
    interface RootParamList {
      new: undefined;
      pools: undefined;
      find: undefined;
      details: {// tipagem de rota que precisa de parâmetro
        id: string
      }
    }
  }
}