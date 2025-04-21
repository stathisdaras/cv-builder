export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  mainContributions?: string[];
  techStack?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  thesis?: string;
  supervisor?: string;
}

export interface Certification {
  certificationName: string;
  institution: string;
}

export interface Language {
  name: string;
  institute: string;
  proficiency: string;
}

export interface CVData {
  name: string;
  email: string;
  phone: string;
  title: string;
  profileImage?: string;
  briefProfile: string;
  skills: { [category: string]: string[] };
  workExperiences: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  interests: string[];
  references?: string;
} 