export interface Address {
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipcode: string;
  complement?: string;
}

export interface UpdateAddress {
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  complement?: string;
}
