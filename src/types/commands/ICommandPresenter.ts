export interface ICommandPresenter<TOutput = unknown> {
  present(output: TOutput): Promise<void>;
}
