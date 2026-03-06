export type OpenPosition = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  type: string | null;
  description: string | null;
};

export type Certificate = {
  id: string;
  name: string;
  file_url: string;
  thumbnail_url: string | null;
  sort_order: number;
};

export type Client = {
  id: string;
  name: string;
  logo_url: string;
  sort_order: number;
};
