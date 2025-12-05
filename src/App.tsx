import { use, useEffect, useLayoutEffect, useState } from 'react';
import './App.css';
import { candidatesFileURL, skillToPositionMap } from './const';
import { Candidate, Education, WorkAvailability } from './types';

// function App() {
//   const [candidates, setCandidates] = useState<Candidate[]>([]);
//   const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
//   const [locationFilter, setLocationFilter] = useState('');
//   const [positionFilter, setPositionFilter] = useState('');
//   const [availabilityFilter, setAvailabilityFilter] = useState<WorkAvailability>(WorkAvailability.FullTime);
//   const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     const fetchFiles = async () => {
//       try {
//         const response = await fetch(candidatesFileURL);
//       const data = await response.json() as Candidate[];
//       setCandidates(data);
//       setFilteredCandidates(data);
//       } catch (error) {
        
//       }
      
//     };
//     fetchFiles();
//   }, []);

//   const getCandidatePositions = (skills: string[]): string[] => {
//     return Object.entries(skillToPositionMap).reduce<string[]>((positions, [position, requiredSkills]) => {
//       if (skills.some(skill => requiredSkills.includes(skill))) {
//         positions.push(position);
//       }
//       return positions;
//     }, []);
//   };

//   const calculateWorkTime = (education: { degrees?: { endDate?: string }[] }): number => {
//     if (!education?.degrees || education.degrees.length === 0) return 0;
  
//     const latestEndDate = education.degrees
//       .map(degree => new Date(degree.endDate || ''))
//       .filter(date => !isNaN(date.getTime())) // Filter out invalid dates
//       .sort((a, b) => b.getTime() - a.getTime())[0]; // Get the latest end date
  
//     if (!latestEndDate) return 0;
  
//     const currentTime = new Date();
//     const diffInYears = (currentTime.getTime() - latestEndDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
//     return Math.floor(diffInYears); // Return the difference in years
//   };

//   const handleFilterChange = () => {
//     const filtered = candidates.filter(candidate =>
//       (locationFilter === '' ||
//         candidate.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
//       (positionFilter === '' ||
//         getCandidatePositions(candidate.skills).some(pos => pos.toLowerCase().includes(positionFilter.toLowerCase())))
//     );
  
//     const sorted = filtered.sort((a, b) => {
//       const workTimeA = calculateWorkTime(a.education);
//       const workTimeB = calculateWorkTime(b.education);
//       return workTimeB - workTimeA; // Sort in descending order of work-time
//     });
  
//     setFilteredCandidates(sorted);
//   };

//   const openModal = (candidate: Candidate) => {
//     setSelectedCandidate(candidate);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setSelectedCandidate(null);
//     setIsModalOpen(false);
//   };

//   const positionOptions = Object.keys(skillToPositionMap);

//   return (
//     <div className="App">
//       <div>total candidates count: {filteredCandidates.length}</div>
//       <div>
//         <input
//           type="text"
//           placeholder="Filter by location"
//           value={locationFilter}
//           onChange={(e) => setLocationFilter(e.target.value)}
//         />
//         <select
//           value={positionFilter}
//           onChange={(e) => setPositionFilter(e.target.value)}
//         >
//           <option value="">All Positions</option>
//           {positionOptions.map((position, index) => (
//             <option key={index} value={position}>
//               {position}
//             </option>
//           ))}
//         </select>
//         <select
//           value={availabilityFilter}
//           onChange={(e) => setAvailabilityFilter(e.target.value as WorkAvailability)}
//         >
//           <option value={WorkAvailability.FullTime}>Full-Time</option>
//           <option value={WorkAvailability.PartTime}>Part-Time</option>
//         </select>
//         <button onClick={handleFilterChange}>Apply Filters</button>
//       </div>
//       <table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Location</th>
//             <th>Position</th>
//             <th>Work-Time (Years)</th>
//             <th>Salary</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredCandidates.map((candidate, index) => (
//             <tr key={index}>
//               <td>{candidate.name}</td>
//               <td>{candidate.location}</td>
//               <td>{getCandidatePositions(candidate.skills).join(', ') || 'N/A'}</td>
//               <td>{calculateWorkTime(candidate.education)}</td>
//               <td>
//                 {availabilityFilter
//                   ? candidate.annual_salary_expectation[availabilityFilter] || 'N/A'
//                   : 'N/A'}
//               </td>
//               <td>
//                 <button onClick={() => openModal(candidate)}>View Details</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {isModalOpen && selectedCandidate && (
//         <div className="modal">
//           <div className="modal-content">
//             <button className="close-button" onClick={closeModal}>Close</button>
//             <h2>{selectedCandidate.name}</h2>
//             <p><strong>Email:</strong> {selectedCandidate.email}</p>
//             <p><strong>Phone:</strong> {selectedCandidate.phone}</p>
//             <p><strong>Location:</strong> {selectedCandidate.location}</p>
//             <p><strong>Work Availability:</strong> {selectedCandidate.work_availability.join(', ')}</p>
//             <p><strong>Skills:</strong> {selectedCandidate.skills.join(', ')}</p>
//             <p><strong>Salary Expectation:</strong> {Object.entries(selectedCandidate.annual_salary_expectation)
//               .map(([key, value]) => `${key}: ${value}`)
//               .join(', ')}</p>
//             <p><strong>Education:</strong></p>
//             {selectedCandidate.education?.degrees && selectedCandidate.education.degrees.length > 0 ? (
//               <ul>
//                 {selectedCandidate.education.degrees.map((degree, idx) => (
//                   <li key={idx}>
//                     <p>Degree: {degree.degree || 'N/A'}</p>
//                     <p>Institution: {degree.originalSchool || 'N/A'}</p>
//                     <p>Start Date: {degree.startDate || 'N/A'}</p>
//                     <p>End Date: {degree.endDate || 'N/A'}</p>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No education details available.</p>
//             )}
//             <p><strong>Work Experiences:</strong></p>
//             <ul>
//               {selectedCandidate.work_experiences.map((exp, idx) => (
//                 <li key={idx}>{exp.roleName} at {exp.company}</li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

function App() {

  useEffect(() => {
    console.log('App mounted');
  }, []);
  useLayoutEffect(() => {
    console.log('App layout effect');
  }, []);

  console.log('App rendered');
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  // one handler for all inputs
  const handleChange = (e: any) => {
    console.log(e.target);
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value    // use the name as the key
    }));
  };

  return (
    <form>
      <div>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />
      </div>
      <div>
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
      />
      </div>
      <div>
      <input
      type='checkbox'
        name="email"
        value={form.email}
        onChange={handleChange}
      />
      </div>
      <div>
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
      />
      </div>
      <button type="submit">Send</button>
    </form>
  );
}

export default App;