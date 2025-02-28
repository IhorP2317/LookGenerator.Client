export interface BaseEntity {
  id: string;
  createdAt: string;
  createdBy?: string;
  modifiedBy?: string;
  modifiedAt?: string;
}
