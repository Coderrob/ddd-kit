/**
 * Use case for superseding one UID with another.
 */
export interface IUIdSupersedeUseCase {
  execute(oldUid: string, newUid: string): Promise<void>;
}
