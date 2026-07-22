export interface JourneyStop {
  id: string; 
  order: number; 
  title: string; 
  reference: string; 
  era: string; 
  location: string; 
  scripture: string; 
  contaxt: string; 
  connection: string; 
  people: string[]; 
  places: string[]
  themes: string[]; 
  prophecy?: string; 
  reflection: string; 
  prayer: string;
}