export interface Candidate {
    name: string;
    email: string;
    phone: string;
    location: string;
    submitted_at: string; // ISO date string
    work_availability: WorkAvailability[];
    annual_salary_expectation: Record<WorkAvailability, string>; // e.g., { "full-time": "$143487" }
    work_experiences: WorkExperience[];
    education: Education;
    skills: string[];
  }

  export enum WorkAvailability {
    PartTime = 'part-time',
    FullTime = 'full-time',
  }
  
  export interface WorkExperience {
    company: string;
    roleName: string;
  }
  
  export interface Education {
    highest_level: string;
    degrees: Degree[];
  }
  
  export interface Degree {
    degree: string;
    subject: string;
    school: string;
    gpa: string;
    startDate: string; // Year as string
    endDate: string; // Year as string
    originalSchool: string;
    isTop50: boolean;
  }