/* ── IPMH In-Memory Database (mirrors SQL seed) ── */
const DB = (() => {
  const specialties = [
    {id:1,name:'Orthopedics'},{id:2,name:'Geriatrics'},{id:3,name:'Cardiology'},
    {id:4,name:'Neurology'},{id:5,name:'Oncology'},{id:6,name:'Pediatrics'},
    {id:7,name:'Dermatology'},{id:8,name:'Pulmonology'},{id:9,name:'Gastroenterology'},
    {id:10,name:'Endocrinology'}
  ];

  const wards = [
    {name:'Ward A',specialty_id:1},{name:'Ward B',specialty_id:2},
    {name:'Ward C',specialty_id:3},{name:'Ward D',specialty_id:4},
    {name:'Ward E',specialty_id:5},{name:'Ward F',specialty_id:6},
    {name:'Ward G',specialty_id:7},{name:'Ward H',specialty_id:8},
    {name:'Ward I',specialty_id:9},{name:'Ward J',specialty_id:10}
  ];

  const staff = [
    {no:1,name:'Dr. James Carter'},{no:2,name:'Dr. Sarah Mitchell'},
    {no:3,name:'Dr. Omar Hassan'},{no:4,name:'Dr. Priya Patel'},
    {no:5,name:'Dr. Tom Reynolds'},{no:6,name:'Dr. Maria Lopez'},
    {no:7,name:'Dr. David Kim'},{no:8,name:'Dr. Claire Donovan'},
    {no:9,name:'Dr. Samuel Osei'},{no:10,name:'Dr. Nadia Farouk'},
    {no:11,name:'Dr. Richard Blake'},{no:12,name:'Dr. Helen Thornton'},
    {no:13,name:'Dr. Alex Murphy'},{no:14,name:'Dr. Fatima Zahra'},
    {no:101,name:'Nurse Emma Watson'},{no:102,name:'Nurse John Ahmed'},
    {no:103,name:'Nurse Lisa Nguyen'},{no:104,name:'Nurse Paul Okeke'},
    {no:105,name:'Nurse Anna Petrova'},{no:106,name:'Nurse James Okafor'},
    {no:107,name:'Nurse Mei Lin'},{no:108,name:'Nurse Chris Owens'},
    {no:109,name:'Nurse Fatou Diallo'},{no:110,name:'Nurse Mark Spencer'},
    {no:111,name:'Nurse Grace Mensah'},{no:112,name:'Nurse Ben Adeyemi'},
    {no:113,name:'Nurse Olivia White'},{no:114,name:'Nurse Sam Khan'},
    {no:115,name:'Nurse Diane Ferreira'},{no:116,name:'Nurse Rachel Singh'},
    {no:117,name:'Nurse Kevin Abubakar'},{no:118,name:'Nurse Tina Kwame'},
    {no:119,name:'Nurse Leo Castillo'},{no:120,name:'Nurse Rosa Ferreira'},
    {no:121,name:'Nurse Yusuf Diallo'},{no:122,name:'Nurse Chloe Mensah'},
    {no:123,name:'Nurse Patrick Osei'},{no:124,name:'Nurse Amara Blake'},
    {no:125,name:'Nurse Derek Pham'},{no:126,name:'Nurse Nadia Owens'},
    {no:127,name:'Nurse Joe Nakamura'}
  ];

  const doctors = [
    {no:11,position:'Registrar',joined:'2015-03-01',consultant_no:null},
    {no:12,position:'Registrar',joined:'2014-07-15',consultant_no:null},
    {no:13,position:'Registrar',joined:'2013-05-20',consultant_no:null},
    {no:14,position:'Registrar',joined:'2012-09-10',consultant_no:null},
    {no:1,position:'Junior Houseman',joined:'2022-08-01',consultant_no:11},
    {no:2,position:'Senior Houseman',joined:'2021-06-15',consultant_no:11},
    {no:3,position:'Asst Registrar',joined:'2020-01-10',consultant_no:11},
    {no:4,position:'Junior Houseman',joined:'2023-02-01',consultant_no:12},
    {no:5,position:'Senior Houseman',joined:'2019-11-20',consultant_no:12},
    {no:6,position:'Asst Registrar',joined:'2021-03-05',consultant_no:12},
    {no:7,position:'Junior Houseman',joined:'2023-07-01',consultant_no:13},
    {no:8,position:'Senior Houseman',joined:'2022-01-15',consultant_no:13},
    {no:9,position:'Registrar',joined:'2018-04-01',consultant_no:13},
    {no:10,position:'Asst Registrar',joined:'2020-09-01',consultant_no:14}
  ];

  const consultants = [
    {no:11,specialty:'Orthopedics'},
    {no:12,specialty:'Cardiology'},
    {no:13,specialty:'Neurology'},
    {no:14,specialty:'Oncology'}
  ];

  const nurses = [
    {no:101,type:'Day Sister',ward:'Ward A',unit:1},
    {no:102,type:'Night Sister',ward:'Ward A',unit:1},
    {no:103,type:'Staff Nurse',ward:'Ward A',unit:1},
    {no:104,type:'Non-Registered',ward:'Ward A',unit:1},
    {no:105,type:'Day Sister',ward:'Ward B',unit:2},
    {no:106,type:'Night Sister',ward:'Ward B',unit:2},
    {no:107,type:'Staff Nurse',ward:'Ward B',unit:2},
    {no:108,type:'Non-Registered',ward:'Ward B',unit:2},
    {no:109,type:'Day Sister',ward:'Ward C',unit:3},
    {no:110,type:'Night Sister',ward:'Ward C',unit:3},
    {no:111,type:'Staff Nurse',ward:'Ward C',unit:3},
    {no:112,type:'Non-Registered',ward:'Ward C',unit:3},
    {no:113,type:'Day Sister',ward:'Ward D',unit:4},
    {no:114,type:'Staff Nurse',ward:'Ward D',unit:4},
    {no:115,type:'Night Sister',ward:'Ward D',unit:4},
    {no:116,type:'Day Sister',ward:'Ward E',unit:5},
    {no:117,type:'Staff Nurse',ward:'Ward E',unit:5},
    {no:118,type:'Non-Registered',ward:'Ward E',unit:5},
    {no:119,type:'Day Sister',ward:'Ward F',unit:6},
    {no:120,type:'Staff Nurse',ward:'Ward F',unit:6},
    {no:121,type:'Night Sister',ward:'Ward F',unit:6},
    {no:122,type:'Day Sister',ward:'Ward G',unit:7},
    {no:123,type:'Staff Nurse',ward:'Ward G',unit:7},
    {no:124,type:'Non-Registered',ward:'Ward G',unit:7},
    {no:125,type:'Day Sister',ward:'Ward H',unit:8},
    {no:126,type:'Staff Nurse',ward:'Ward H',unit:8},
    {no:127,type:'Night Sister',ward:'Ward H',unit:8}
  ];

  const careUnits = [
    {no:1,ward:'Ward A',inCharge:103},{no:2,ward:'Ward B',inCharge:107},
    {no:3,ward:'Ward C',inCharge:111},{no:4,ward:'Ward D',inCharge:114},
    {no:5,ward:'Ward E',inCharge:117},{no:6,ward:'Ward F',inCharge:120},
    {no:7,ward:'Ward G',inCharge:123},{no:8,ward:'Ward H',inCharge:126}
  ];

  const beds = (() => {
    const b=[];
    const wmap={'Ward A':8,'Ward B':7,'Ward C':7,'Ward D':5,'Ward E':5,
                'Ward F':4,'Ward G':4,'Ward H':4,'Ward I':3,'Ward J':3};
    let n=1;
    for(const [ward,cnt] of Object.entries(wmap)){
      for(let i=0;i<cnt;i++) b.push({no:n++,ward});
    }
    return b;
  })();

  const complaints = [
    {code:'C001',desc:'Hip Fracture'},{code:'C002',desc:'Knee Osteoarthritis'},
    {code:'C003',desc:'Spinal Stenosis'},{code:'C004',desc:'Heart Failure'},
    {code:'C005',desc:'Atrial Fibrillation'},{code:'C006',desc:'Hypertension'},
    {code:'C007',desc:'Stroke'},{code:'C008',desc:'Epilepsy'},
    {code:'C009',desc:'Lung Cancer'},{code:'C010',desc:'Asthma'},
    {code:'C011',desc:'Pneumonia'},{code:'C012',desc:'Dementia'},
    {code:'C013',desc:'Diabetes Type 2'},{code:'C014',desc:'Deep Vein Thrombosis'},
    {code:'C015',desc:'Appendicitis'}
  ];

  const treatments = [
    {code:'T001',desc:'Hip Replacement Surgery'},{code:'T002',desc:'Physiotherapy'},
    {code:'T003',desc:'Pain Management'},{code:'T004',desc:'ACE Inhibitors'},
    {code:'T005',desc:'Beta Blockers'},{code:'T006',desc:'Cardioversion'},
    {code:'T007',desc:'Anticoagulant Therapy'},{code:'T008',desc:'Anti-epileptic Drugs'},
    {code:'T009',desc:'Chemotherapy'},{code:'T010',desc:'Radiation Therapy'},
    {code:'T011',desc:'Bronchodilators'},{code:'T012',desc:'IV Antibiotics'},
    {code:'T013',desc:'Cognitive Therapy'},{code:'T014',desc:'Insulin Therapy'},
    {code:'T015',desc:'Appendectomy'}
  ];

  const patients = [
    {no:1,name:'Alice Thompson',dob:'1948-03-12',admitted:'2025-01-05',discharged:null,ward:'Ward A',unit:1,bed:1,doctor:1,consultant:11},
    {no:2,name:'Brian Okafor',dob:'1952-07-22',admitted:'2025-01-08',discharged:null,ward:'Ward A',unit:1,bed:2,doctor:2,consultant:11},
    {no:3,name:'Catherine Yip',dob:'1965-11-03',admitted:'2025-01-15',discharged:'2025-02-10',ward:'Ward A',unit:1,bed:3,doctor:3,consultant:11},
    {no:4,name:'David Mensah',dob:'1970-05-17',admitted:'2025-01-20',discharged:null,ward:'Ward A',unit:1,bed:4,doctor:1,consultant:11},
    {no:5,name:'Erika Jansson',dob:'1980-09-28',admitted:'2025-02-01',discharged:null,ward:'Ward A',unit:1,bed:5,doctor:2,consultant:11},
    {no:6,name:'Frank Diallo',dob:'1955-12-10',admitted:'2025-02-03',discharged:null,ward:'Ward B',unit:2,bed:9,doctor:5,consultant:12},
    {no:7,name:'Grace Abubakar',dob:'1940-04-02',admitted:'2025-02-05',discharged:null,ward:'Ward B',unit:2,bed:10,doctor:6,consultant:12},
    {no:8,name:'Henry Peterson',dob:'1938-08-30',admitted:'2025-02-07',discharged:null,ward:'Ward B',unit:2,bed:11,doctor:5,consultant:12},
    {no:9,name:'Irene Castillo',dob:'1945-01-25',admitted:'2025-02-10',discharged:'2025-03-01',ward:'Ward B',unit:2,bed:12,doctor:6,consultant:12},
    {no:10,name:'James Nakamura',dob:'1950-06-14',admitted:'2025-02-14',discharged:null,ward:'Ward B',unit:2,bed:13,doctor:5,consultant:12},
    {no:11,name:'Karen Adeyemi',dob:'1972-10-08',admitted:'2025-02-20',discharged:null,ward:'Ward C',unit:3,bed:16,doctor:4,consultant:12},
    {no:12,name:'Liam Farouk',dob:'1960-03-19',admitted:'2025-02-22',discharged:null,ward:'Ward C',unit:3,bed:17,doctor:6,consultant:12},
    {no:13,name:'Maria Sousa',dob:'1985-07-11',admitted:'2025-03-01',discharged:null,ward:'Ward C',unit:3,bed:18,doctor:4,consultant:12},
    {no:14,name:'Nils Bjornsson',dob:'1943-02-28',admitted:'2025-03-03',discharged:null,ward:'Ward C',unit:3,bed:19,doctor:5,consultant:12},
    {no:15,name:'Olivia Pham',dob:'1990-12-05',admitted:'2025-03-05',discharged:'2025-03-20',ward:'Ward C',unit:3,bed:20,doctor:6,consultant:12},
    {no:16,name:'Patrick Owens',dob:'1957-04-16',admitted:'2025-03-07',discharged:null,ward:'Ward D',unit:4,bed:23,doctor:7,consultant:13},
    {no:17,name:'Queen Eze',dob:'1963-09-22',admitted:'2025-03-09',discharged:null,ward:'Ward D',unit:4,bed:24,doctor:8,consultant:13},
    {no:18,name:'Robert Singh',dob:'1948-11-30',admitted:'2025-03-11',discharged:null,ward:'Ward D',unit:4,bed:25,doctor:9,consultant:13},
    {no:19,name:'Sandra Ferreira',dob:'1978-06-07',admitted:'2025-03-13',discharged:null,ward:'Ward D',unit:4,bed:26,doctor:7,consultant:13},
    {no:20,name:'Thomas Kwame',dob:'1935-01-18',admitted:'2025-03-15',discharged:null,ward:'Ward D',unit:4,bed:27,doctor:8,consultant:13},
    {no:21,name:'Uma Krishnan',dob:'1969-08-24',admitted:'2025-03-17',discharged:null,ward:'Ward E',unit:5,bed:28,doctor:10,consultant:14},
    {no:22,name:'Victor Anand',dob:'1955-02-13',admitted:'2025-03-19',discharged:null,ward:'Ward E',unit:5,bed:29,doctor:10,consultant:14},
    {no:23,name:'Wendy Osei',dob:'1940-05-09',admitted:'2025-03-20',discharged:null,ward:'Ward E',unit:5,bed:30,doctor:10,consultant:14},
    {no:24,name:'Xavier Blanc',dob:'1972-11-01',admitted:'2025-03-22',discharged:null,ward:'Ward E',unit:5,bed:31,doctor:10,consultant:14},
    {no:25,name:'Yemi Adebayo',dob:'1980-07-30',admitted:'2025-03-25',discharged:null,ward:'Ward E',unit:5,bed:32,doctor:10,consultant:14},
    {no:26,name:'Zara Hussain',dob:'1995-03-14',admitted:'2025-03-28',discharged:null,ward:'Ward F',unit:6,bed:33,doctor:3,consultant:12},
    {no:27,name:'Aaron Blake',dob:'1988-10-20',admitted:'2025-04-01',discharged:null,ward:'Ward A',unit:1,bed:6,doctor:1,consultant:11},
    {no:28,name:'Bethany Cross',dob:'1975-01-05',admitted:'2025-04-03',discharged:null,ward:'Ward B',unit:2,bed:14,doctor:6,consultant:12},
    {no:29,name:'Carlos Rivera',dob:'1962-04-27',admitted:'2025-04-05',discharged:null,ward:'Ward C',unit:3,bed:21,doctor:4,consultant:12},
    {no:30,name:'Diana Chukwu',dob:'1953-08-15',admitted:'2025-04-07',discharged:null,ward:'Ward G',unit:7,bed:37,doctor:9,consultant:13}
  ];

  const pcts = [
    {patient:1,complaint:'C001',treatment:'T001',started:'2025-01-06',doctor:1,ended:null},
    {patient:1,complaint:'C001',treatment:'T002',started:'2025-01-20',doctor:1,ended:null},
    {patient:2,complaint:'C002',treatment:'T003',started:'2025-01-09',doctor:2,ended:'2025-02-15'},
    {patient:2,complaint:'C002',treatment:'T002',started:'2025-02-16',doctor:2,ended:null},
    {patient:3,complaint:'C003',treatment:'T003',started:'2025-01-16',doctor:3,ended:'2025-02-08'},
    {patient:4,complaint:'C001',treatment:'T001',started:'2025-01-21',doctor:1,ended:null},
    {patient:4,complaint:'C006',treatment:'T005',started:'2025-01-25',doctor:1,ended:null},
    {patient:5,complaint:'C002',treatment:'T002',started:'2025-02-02',doctor:2,ended:null},
    {patient:6,complaint:'C004',treatment:'T004',started:'2025-02-04',doctor:5,ended:null},
    {patient:6,complaint:'C006',treatment:'T005',started:'2025-02-04',doctor:5,ended:null},
    {patient:7,complaint:'C012',treatment:'T013',started:'2025-02-06',doctor:6,ended:null},
    {patient:8,complaint:'C004',treatment:'T004',started:'2025-02-08',doctor:5,ended:null},
    {patient:9,complaint:'C005',treatment:'T006',started:'2025-02-11',doctor:6,ended:'2025-02-28'},
    {patient:10,complaint:'C004',treatment:'T004',started:'2025-02-15',doctor:5,ended:null},
    {patient:10,complaint:'C014',treatment:'T007',started:'2025-02-15',doctor:5,ended:null},
    {patient:11,complaint:'C005',treatment:'T005',started:'2025-02-21',doctor:4,ended:null},
    {patient:11,complaint:'C006',treatment:'T004',started:'2025-02-21',doctor:4,ended:null},
    {patient:12,complaint:'C004',treatment:'T004',started:'2025-02-23',doctor:6,ended:null},
    {patient:13,complaint:'C005',treatment:'T006',started:'2025-03-02',doctor:4,ended:null},
    {patient:14,complaint:'C004',treatment:'T004',started:'2025-03-04',doctor:5,ended:null},
    {patient:14,complaint:'C006',treatment:'T005',started:'2025-03-04',doctor:5,ended:null},
    {patient:15,complaint:'C005',treatment:'T007',started:'2025-03-06',doctor:6,ended:'2025-03-18'},
    {patient:16,complaint:'C007',treatment:'T002',started:'2025-03-08',doctor:7,ended:null},
    {patient:17,complaint:'C008',treatment:'T008',started:'2025-03-10',doctor:8,ended:null},
    {patient:18,complaint:'C007',treatment:'T003',started:'2025-03-12',doctor:9,ended:null},
    {patient:19,complaint:'C008',treatment:'T008',started:'2025-03-14',doctor:7,ended:null},
    {patient:20,complaint:'C012',treatment:'T013',started:'2025-03-16',doctor:8,ended:null},
    {patient:21,complaint:'C009',treatment:'T009',started:'2025-03-18',doctor:10,ended:null},
    {patient:22,complaint:'C009',treatment:'T010',started:'2025-03-20',doctor:10,ended:null},
    {patient:23,complaint:'C009',treatment:'T009',started:'2025-03-21',doctor:10,ended:null},
    {patient:24,complaint:'C009',treatment:'T009',started:'2025-03-23',doctor:10,ended:null},
    {patient:24,complaint:'C006',treatment:'T005',started:'2025-03-23',doctor:10,ended:null},
    {patient:25,complaint:'C009',treatment:'T010',started:'2025-03-26',doctor:10,ended:null},
    {patient:26,complaint:'C010',treatment:'T011',started:'2025-03-29',doctor:3,ended:null},
    {patient:27,complaint:'C001',treatment:'T001',started:'2025-04-02',doctor:1,ended:null},
    {patient:28,complaint:'C004',treatment:'T004',started:'2025-04-04',doctor:6,ended:null},
    {patient:29,complaint:'C005',treatment:'T006',started:'2025-04-06',doctor:4,ended:null},
    {patient:30,complaint:'C011',treatment:'T012',started:'2025-04-08',doctor:9,ended:null}
  ];

  const doctorExp = [
    {id:1,staff:1,from:'2018-09-01',to:'2020-07-31',pos:'Student',est:'City General Hospital'},
    {id:2,staff:1,from:'2020-08-01',to:'2021-07-31',pos:'Junior Houseman',est:'Royal Infirmary'},
    {id:3,staff:1,from:'2021-08-01',to:'2022-07-31',pos:'Senior Houseman',est:'St. Mary Medical'},
    {id:4,staff:2,from:'2017-09-01',to:'2019-08-31',pos:'Student',est:'Northern General'},
    {id:5,staff:2,from:'2019-09-01',to:'2021-05-31',pos:'Junior Houseman',est:'County Hospital'},
    {id:6,staff:3,from:'2016-01-01',to:'2018-12-31',pos:'Student',est:'Metro Medical Centre'},
    {id:7,staff:3,from:'2019-01-01',to:'2020-06-30',pos:'Junior Houseman',est:'University Hospital'},
    {id:8,staff:4,from:'2019-08-01',to:'2021-07-31',pos:'Student',est:'Greenfield Clinic'},
    {id:9,staff:5,from:'2015-06-01',to:'2017-05-31',pos:'Student',est:'Highland General'},
    {id:10,staff:5,from:'2017-06-01',to:'2019-05-31',pos:'Junior Houseman',est:'Valley Medical'},
    {id:11,staff:6,from:'2017-01-01',to:'2018-12-31',pos:'Student',est:'Central Hospital'},
    {id:12,staff:6,from:'2019-01-01',to:'2020-12-31',pos:'Junior Houseman',est:'West Side Clinic'},
    {id:13,staff:7,from:'2020-07-01',to:'2022-06-30',pos:'Student',est:'East Medical College'},
    {id:14,staff:8,from:'2019-01-01',to:'2021-06-30',pos:'Student',est:'Riverdale Hospital'},
    {id:15,staff:9,from:'2014-01-01',to:'2016-06-30',pos:'Student',est:'Oakwood General'},
    {id:16,staff:9,from:'2016-07-01',to:'2018-03-31',pos:'Junior Houseman',est:'Mount Vernon Hospital'},
    {id:17,staff:10,from:'2017-09-01',to:'2019-08-31',pos:'Student',est:'Lakeside Medical'},
    {id:18,staff:11,from:'2008-08-01',to:'2010-07-31',pos:'Junior Houseman',est:'St. Luke Hospital'},
    {id:19,staff:11,from:'2010-08-01',to:'2013-07-31',pos:'Senior Houseman',est:'National Medical Centre'},
    {id:20,staff:12,from:'2006-06-01',to:'2009-05-31',pos:'Junior Houseman',est:'Harborview Hospital'}
  ];

  const reviews = [
    {id:1,doctor:1,date:'2023-01-15',grade:'B+',reviewer:11},
    {id:2,doctor:1,date:'2023-07-15',grade:'A-',reviewer:11},
    {id:3,doctor:2,date:'2023-01-20',grade:'B',reviewer:11},
    {id:4,doctor:2,date:'2023-07-20',grade:'B+',reviewer:11},
    {id:5,doctor:3,date:'2023-02-10',grade:'A',reviewer:11},
    {id:6,doctor:3,date:'2023-08-10',grade:'A',reviewer:11},
    {id:7,doctor:4,date:'2023-03-01',grade:'C+',reviewer:12},
    {id:8,doctor:4,date:'2023-09-01',grade:'B-',reviewer:12},
    {id:9,doctor:5,date:'2023-02-15',grade:'B+',reviewer:12},
    {id:10,doctor:5,date:'2023-08-15',grade:'A-',reviewer:12},
    {id:11,doctor:6,date:'2023-03-20',grade:'B',reviewer:12},
    {id:12,doctor:6,date:'2023-09-20',grade:'B+',reviewer:12},
    {id:13,doctor:7,date:'2023-04-01',grade:'B-',reviewer:13},
    {id:14,doctor:7,date:'2023-10-01',grade:'B',reviewer:13},
    {id:15,doctor:8,date:'2023-04-15',grade:'A',reviewer:13},
    {id:16,doctor:8,date:'2023-10-15',grade:'A',reviewer:13},
    {id:17,doctor:9,date:'2023-05-01',grade:'B+',reviewer:13},
    {id:18,doctor:9,date:'2023-11-01',grade:'A-',reviewer:13},
    {id:19,doctor:10,date:'2023-05-15',grade:'B',reviewer:14},
    {id:20,doctor:10,date:'2023-11-15',grade:'B+',reviewer:14}
  ];

  /* ── Helpers ── */
  function getStaffName(no){ return (staff.find(s=>s.no===no)||{name:'Unknown'}).name; }
  function getSpecialtyName(id){ return (specialties.find(s=>s.id===id)||{name:'—'}).name; }
  function getWardSpecialty(wardName){ const w=wards.find(x=>x.name===wardName); return w?getSpecialtyName(w.specialty_id):'—'; }
  function getComplaintDesc(code){ return (complaints.find(c=>c.code===code)||{desc:'—'}).desc; }
  function getTreatmentDesc(code){ return (treatments.find(t=>t.code===code)||{desc:'—'}).desc; }
  function isConsultant(no){ return consultants.some(c=>c.no===no); }

  function wardOccupancy(){
    const occ={};
    wards.forEach(w=>occ[w.name]=0);
    patients.filter(p=>!p.discharged).forEach(p=>{ if(occ[p.ward]!==undefined) occ[p.ward]++; });
    const cap={'Ward A':8,'Ward B':7,'Ward C':7,'Ward D':5,'Ward E':5,
                'Ward F':4,'Ward G':4,'Ward H':4,'Ward I':3,'Ward J':3};
    return wards.map(w=>({ward:w.name,occupied:occ[w.name],capacity:cap[w.name]}));
  }

  return {
    specialties, wards, staff, doctors, consultants, nurses,
    careUnits, beds, complaints, treatments, patients, pcts,
    doctorExp, reviews,
    getStaffName, getSpecialtyName, getWardSpecialty,
    getComplaintDesc, getTreatmentDesc, isConsultant, wardOccupancy,
    nextId(arr, key='id'){ return Math.max(0,...arr.map(x=>x[key]||0))+1; }
  };
})();
