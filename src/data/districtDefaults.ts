// Default agricultural parameters for Indian districts
// Based on typical values for major crop-producing regions

export interface DistrictDefaults {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

// Map of states to their districts
const stateDistrictMap: Record<string, string[]> = {
  "Punjab": ["AMRITSAR", "LUDHIANA", "PATIALA", "JALANDHAR", "BATHINDA", "MOGA", "SANGRUR", "FEROZEPUR"],
  "Haryana": ["KARNAL", "HISAR", "PANIPAT", "SONIPAT", "ROHTAK", "KURUKSHETRA", "AMBALA", "YAMUNANAGAR"],
  "Uttar Pradesh": ["MEERUT", "ALIGARH", "AGRA", "LUCKNOW", "KANPUR", "VARANASI", "ALLAHABAD", "GHAZIABAD", "NOIDA", "BAREILLY"],
  "Maharashtra": ["NAGPUR", "PUNE", "NASHIK", "MUMBAI SUBURBAN", "THANE", "AURANGABAD", "SOLAPUR", "AHMEDNAGAR", "KOLHAPUR"],
  "Karnataka": ["BANGALORE RURAL", "MYSORE", "BELGAUM", "BANGALORE URBAN", "TUMKUR", "MANDYA", "HASSAN", "DHARWAD", "SHIMOGA"],
  "Tamil Nadu": ["COIMBATORE", "SALEM", "ERODE", "CHENNAI", "MADURAI", "TIRUCHIRAPPALLI", "TIRUNELVELI", "VELLORE", "THANJAVUR"],
  "West Bengal": ["BARDHAMAN", "MURSHIDABAD", "NADIA", "NORTH 24 PARGANAS", "SOUTH 24 PARGANAS", "HOOGHLY", "HOWRAH", "MIDNAPORE"],
  "Madhya Pradesh": ["INDORE", "BHOPAL", "JABALPUR", "UJJAIN", "SAGAR", "RATLAM", "GWALIOR", "REWA", "SATNA"],
  "Rajasthan": ["JAIPUR", "UDAIPUR", "KOTA", "JODHPUR", "BIKANER", "AJMER", "ALWAR", "BHARATPUR", "SIKAR"],
  "Gujarat": ["AHMEDABAD", "SURAT", "VADODARA", "RAJKOT", "BHAVNAGAR", "JAMNAGAR", "JUNAGADH", "ANAND", "MEHSANA"],
  "Andhra Pradesh": ["KRISHNA", "GUNTUR", "WEST GODAVARI", "EAST GODAVARI", "PRAKASAM", "CHITTOOR", "VISAKHAPATNAM", "NELLORE"],
  "Telangana": ["HYDERABAD", "RANGAREDDY", "MEDAK", "NIZAMABAD", "KARIMNAGAR", "WARANGAL", "KHAMMAM", "NALGONDA"],
  "Kerala": ["THIRUVANANTHAPURAM", "KOLLAM", "PATHANAMTHITTA", "ALAPPUZHA", "KOTTAYAM", "IDUKKI", "ERNAKULAM", "THRISSUR", "PALAKKAD"],
  "Odisha": ["CUTTACK", "PURI", "GANJAM", "BALESWAR", "SAMBALPUR", "MAYURBHANJ", "KHURDA", "KENDRAPARA"],
  "Bihar": ["PATNA", "GAYA", "BHAGALPUR", "MUZAFFARPUR", "DARBHANGA", "PURNIA", "ARRAH", "BEGUSARAI", "KATIHAR"],
  "Jharkhand": ["RANCHI", "DHANBAD", "JAMSHEDPUR", "BOKARO", "GIRIDIH", "HAZARIBAGH", "DEOGHAR", "PALAMU"],
  "Assam": ["KAMRUP", "NAGAON", "SONITPUR", "BARPETA", "DARRANG", "DIBRUGARH", "JORHAT", "SIVASAGAR"],
  "Chhattisgarh": ["RAIPUR", "DURG", "BILASPUR", "KORBA", "RAJNANDGAON", "RAIGARH", "SURGUJA", "BASTAR"],
  "Uttarakhand": ["DEHRADUN", "HARIDWAR", "UDHAM SINGH NAGAR", "NAINITAL", "PAURI GARHWAL", "TEHRI GARHWAL", "ALMORA"],
  "Himachal Pradesh": ["SHIMLA", "KANGRA", "MANDI", "HAMIRPUR", "UNA", "BILASPUR", "SOLAN", "KULLU"],
};

export const districtDefaults: Record<string, DistrictDefaults> = {
  // Punjab
  "AMRITSAR": { N: 85, P: 45, K: 50, temperature: 24, humidity: 65, ph: 7.2, rainfall: 650 },
  "LUDHIANA": { N: 90, P: 48, K: 52, temperature: 23, humidity: 68, ph: 7.4, rainfall: 700 },
  "PATIALA": { N: 88, P: 46, K: 51, temperature: 24, humidity: 66, ph: 7.3, rainfall: 680 },
  "JALANDHAR": { N: 87, P: 45, K: 51, temperature: 23, humidity: 67, ph: 7.3, rainfall: 720 },
  "BATHINDA": { N: 83, P: 44, K: 48, temperature: 25, humidity: 63, ph: 7.5, rainfall: 450 },
  "MOGA": { N: 86, P: 45, K: 50, temperature: 24, humidity: 66, ph: 7.3, rainfall: 680 },
  "SANGRUR": { N: 89, P: 47, K: 51, temperature: 24, humidity: 65, ph: 7.4, rainfall: 650 },
  "FEROZEPUR": { N: 84, P: 44, K: 49, temperature: 25, humidity: 64, ph: 7.4, rainfall: 500 },
  
  // Haryana
  "KARNAL": { N: 82, P: 43, K: 48, temperature: 25, humidity: 62, ph: 7.5, rainfall: 620 },
  "HISAR": { N: 80, P: 42, K: 46, temperature: 26, humidity: 60, ph: 7.6, rainfall: 450 },
  "PANIPAT": { N: 84, P: 44, K: 49, temperature: 25, humidity: 63, ph: 7.4, rainfall: 600 },
  "SONIPAT": { N: 83, P: 43, K: 48, temperature: 25, humidity: 64, ph: 7.5, rainfall: 650 },
  "ROHTAK": { N: 81, P: 42, K: 47, temperature: 26, humidity: 61, ph: 7.5, rainfall: 550 },
  "KURUKSHETRA": { N: 84, P: 44, K: 49, temperature: 24, humidity: 64, ph: 7.4, rainfall: 700 },
  "AMBALA": { N: 85, P: 45, K: 50, temperature: 24, humidity: 66, ph: 7.3, rainfall: 800 },
  "YAMUNANAGAR": { N: 84, P: 44, K: 49, temperature: 24, humidity: 65, ph: 7.4, rainfall: 750 },
  
  // Uttar Pradesh
  "MEERUT": { N: 78, P: 40, K: 45, temperature: 24, humidity: 70, ph: 7.0, rainfall: 850 },
  "ALIGARH": { N: 76, P: 39, K: 44, temperature: 25, humidity: 68, ph: 7.1, rainfall: 800 },
  "AGRA": { N: 75, P: 38, K: 43, temperature: 26, humidity: 65, ph: 7.2, rainfall: 650 },
  "LUCKNOW": { N: 77, P: 39, K: 44, temperature: 26, humidity: 68, ph: 6.9, rainfall: 1000 },
  "KANPUR": { N: 76, P: 39, K: 44, temperature: 27, humidity: 66, ph: 7.0, rainfall: 800 },
  "VARANASI": { N: 75, P: 38, K: 43, temperature: 27, humidity: 70, ph: 6.8, rainfall: 1100 },
  "ALLAHABAD": { N: 74, P: 38, K: 42, temperature: 27, humidity: 68, ph: 6.9, rainfall: 1000 },
  "GHAZIABAD": { N: 78, P: 40, K: 45, temperature: 25, humidity: 69, ph: 7.1, rainfall: 850 },
  "NOIDA": { N: 79, P: 40, K: 45, temperature: 25, humidity: 68, ph: 7.2, rainfall: 800 },
  "BAREILLY": { N: 77, P: 39, K: 44, temperature: 25, humidity: 70, ph: 6.9, rainfall: 1100 },
  
  // Maharashtra
  "NAGPUR": { N: 65, P: 35, K: 40, temperature: 28, humidity: 55, ph: 6.8, rainfall: 1200 },
  "PUNE": { N: 68, P: 36, K: 42, temperature: 27, humidity: 58, ph: 6.9, rainfall: 850 },
  "NASHIK": { N: 70, P: 37, K: 43, temperature: 27, humidity: 60, ph: 7.0, rainfall: 950 },
  "MUMBAI SUBURBAN": { N: 63, P: 34, K: 38, temperature: 28, humidity: 75, ph: 6.7, rainfall: 2400 },
  "THANE": { N: 64, P: 34, K: 39, temperature: 28, humidity: 74, ph: 6.8, rainfall: 2500 },
  "AURANGABAD": { N: 67, P: 36, K: 41, temperature: 28, humidity: 58, ph: 7.0, rainfall: 750 },
  "SOLAPUR": { N: 66, P: 35, K: 40, temperature: 29, humidity: 55, ph: 7.2, rainfall: 550 },
  "AHMEDNAGAR": { N: 69, P: 37, K: 42, temperature: 28, humidity: 57, ph: 7.1, rainfall: 600 },
  "KOLHAPUR": { N: 71, P: 38, K: 43, temperature: 26, humidity: 70, ph: 6.8, rainfall: 1500 },
  
  // Karnataka
  "BANGALORE RURAL": { N: 62, P: 33, K: 38, temperature: 23, humidity: 75, ph: 6.5, rainfall: 950 },
  "MYSORE": { N: 64, P: 34, K: 39, temperature: 24, humidity: 73, ph: 6.6, rainfall: 850 },
  "BELGAUM": { N: 66, P: 35, K: 40, temperature: 25, humidity: 70, ph: 6.7, rainfall: 1050 },
  "BANGALORE URBAN": { N: 63, P: 33, K: 38, temperature: 24, humidity: 74, ph: 6.5, rainfall: 970 },
  "TUMKUR": { N: 64, P: 34, K: 39, temperature: 25, humidity: 70, ph: 6.6, rainfall: 650 },
  "MANDYA": { N: 65, P: 34, K: 39, temperature: 25, humidity: 72, ph: 6.6, rainfall: 750 },
  "HASSAN": { N: 63, P: 33, K: 38, temperature: 24, humidity: 73, ph: 6.5, rainfall: 1100 },
  "DHARWAD": { N: 67, P: 36, K: 41, temperature: 26, humidity: 68, ph: 6.7, rainfall: 850 },
  "SHIMOGA": { N: 65, P: 35, K: 40, temperature: 25, humidity: 75, ph: 6.5, rainfall: 1600 },
  
  // Tamil Nadu
  "COIMBATORE": { N: 55, P: 30, K: 35, temperature: 28, humidity: 68, ph: 6.3, rainfall: 700 },
  "SALEM": { N: 58, P: 31, K: 36, temperature: 29, humidity: 65, ph: 6.4, rainfall: 850 },
  "ERODE": { N: 56, P: 30, K: 35, temperature: 28, humidity: 67, ph: 6.3, rainfall: 750 },
  "CHENNAI": { N: 54, P: 29, K: 34, temperature: 30, humidity: 75, ph: 6.2, rainfall: 1400 },
  "MADURAI": { N: 57, P: 30, K: 35, temperature: 30, humidity: 66, ph: 6.3, rainfall: 850 },
  "TIRUCHIRAPPALLI": { N: 56, P: 30, K: 35, temperature: 29, humidity: 68, ph: 6.3, rainfall: 850 },
  "TIRUNELVELI": { N: 58, P: 31, K: 36, temperature: 29, humidity: 70, ph: 6.4, rainfall: 700 },
  "VELLORE": { N: 55, P: 29, K: 34, temperature: 30, humidity: 65, ph: 6.3, rainfall: 1000 },
  "THANJAVUR": { N: 59, P: 31, K: 36, temperature: 29, humidity: 72, ph: 6.4, rainfall: 950 },
  
  // West Bengal
  "BARDHAMAN": { N: 72, P: 38, K: 42, temperature: 26, humidity: 78, ph: 6.5, rainfall: 1400 },
  "MURSHIDABAD": { N: 74, P: 39, K: 43, temperature: 26, humidity: 80, ph: 6.6, rainfall: 1450 },
  "NADIA": { N: 73, P: 38, K: 42, temperature: 27, humidity: 79, ph: 6.5, rainfall: 1500 },
  "NORTH 24 PARGANAS": { N: 71, P: 37, K: 41, temperature: 27, humidity: 78, ph: 6.4, rainfall: 1750 },
  "SOUTH 24 PARGANAS": { N: 70, P: 37, K: 41, temperature: 27, humidity: 80, ph: 6.4, rainfall: 1800 },
  "HOOGHLY": { N: 72, P: 38, K: 42, temperature: 27, humidity: 77, ph: 6.5, rainfall: 1500 },
  "HOWRAH": { N: 71, P: 37, K: 41, temperature: 27, humidity: 78, ph: 6.4, rainfall: 1650 },
  "MIDNAPORE": { N: 69, P: 36, K: 40, temperature: 27, humidity: 75, ph: 6.5, rainfall: 1400 },
  
  // Madhya Pradesh
  "INDORE": { N: 68, P: 36, K: 41, temperature: 26, humidity: 58, ph: 7.0, rainfall: 950 },
  "BHOPAL": { N: 70, P: 37, K: 42, temperature: 25, humidity: 60, ph: 7.1, rainfall: 1200 },
  "JABALPUR": { N: 69, P: 36, K: 41, temperature: 26, humidity: 62, ph: 6.9, rainfall: 1350 },
  "UJJAIN": { N: 67, P: 36, K: 40, temperature: 26, humidity: 57, ph: 7.1, rainfall: 900 },
  "SAGAR": { N: 68, P: 36, K: 41, temperature: 26, humidity: 61, ph: 6.9, rainfall: 1250 },
  "RATLAM": { N: 66, P: 35, K: 40, temperature: 26, humidity: 56, ph: 7.2, rainfall: 850 },
  "GWALIOR": { N: 71, P: 37, K: 42, temperature: 26, humidity: 59, ph: 7.2, rainfall: 800 },
  "REWA": { N: 69, P: 36, K: 41, temperature: 25, humidity: 63, ph: 6.8, rainfall: 1300 },
  "SATNA": { N: 68, P: 36, K: 41, temperature: 26, humidity: 62, ph: 6.9, rainfall: 1200 },
  
  // Rajasthan
  "JAIPUR": { N: 65, P: 34, K: 38, temperature: 27, humidity: 50, ph: 7.5, rainfall: 650 },
  "UDAIPUR": { N: 67, P: 35, K: 39, temperature: 26, humidity: 55, ph: 7.3, rainfall: 850 },
  "KOTA": { N: 66, P: 34, K: 38, temperature: 27, humidity: 52, ph: 7.4, rainfall: 750 },
  "JODHPUR": { N: 63, P: 33, K: 37, temperature: 28, humidity: 45, ph: 7.6, rainfall: 360 },
  "BIKANER": { N: 62, P: 32, K: 36, temperature: 29, humidity: 42, ph: 7.7, rainfall: 280 },
  "AJMER": { N: 65, P: 34, K: 38, temperature: 27, humidity: 52, ph: 7.4, rainfall: 550 },
  "ALWAR": { N: 66, P: 35, K: 39, temperature: 26, humidity: 55, ph: 7.3, rainfall: 650 },
  "BHARATPUR": { N: 67, P: 35, K: 39, temperature: 26, humidity: 56, ph: 7.2, rainfall: 700 },
  "SIKAR": { N: 64, P: 34, K: 38, temperature: 27, humidity: 48, ph: 7.5, rainfall: 450 },
  
  // Gujarat
  "AHMEDABAD": { N: 60, P: 32, K: 36, temperature: 28, humidity: 55, ph: 7.2, rainfall: 800 },
  "SURAT": { N: 62, P: 33, K: 37, temperature: 27, humidity: 70, ph: 6.8, rainfall: 1200 },
  "VADODARA": { N: 61, P: 32, K: 36, temperature: 28, humidity: 60, ph: 7.0, rainfall: 950 },
  "RAJKOT": { N: 59, P: 31, K: 35, temperature: 28, humidity: 58, ph: 7.1, rainfall: 650 },
  "BHAVNAGAR": { N: 58, P: 31, K: 35, temperature: 28, humidity: 62, ph: 7.0, rainfall: 550 },
  "JAMNAGAR": { N: 57, P: 30, K: 34, temperature: 28, humidity: 65, ph: 6.9, rainfall: 500 },
  "JUNAGADH": { N: 60, P: 32, K: 36, temperature: 27, humidity: 64, ph: 6.9, rainfall: 900 },
  "ANAND": { N: 61, P: 32, K: 36, temperature: 27, humidity: 62, ph: 7.0, rainfall: 800 },
  "MEHSANA": { N: 59, P: 31, K: 35, temperature: 28, humidity: 56, ph: 7.2, rainfall: 700 },
  
  // Andhra Pradesh
  "KRISHNA": { N: 58, P: 31, K: 35, temperature: 29, humidity: 72, ph: 6.5, rainfall: 1050 },
  "GUNTUR": { N: 60, P: 32, K: 36, temperature: 29, humidity: 70, ph: 6.6, rainfall: 950 },
  "WEST GODAVARI": { N: 59, P: 31, K: 35, temperature: 28, humidity: 75, ph: 6.4, rainfall: 1150 },
  "EAST GODAVARI": { N: 58, P: 31, K: 35, temperature: 28, humidity: 76, ph: 6.4, rainfall: 1200 },
  "PRAKASAM": { N: 57, P: 30, K: 34, temperature: 29, humidity: 68, ph: 6.6, rainfall: 750 },
  "CHITTOOR": { N: 56, P: 30, K: 34, temperature: 29, humidity: 65, ph: 6.5, rainfall: 900 },
  "VISAKHAPATNAM": { N: 57, P: 30, K: 35, temperature: 28, humidity: 74, ph: 6.4, rainfall: 1100 },
  "NELLORE": { N: 58, P: 31, K: 35, temperature: 29, humidity: 70, ph: 6.5, rainfall: 950 },
  
  // Telangana
  "HYDERABAD": { N: 61, P: 32, K: 36, temperature: 28, humidity: 62, ph: 6.7, rainfall: 800 },
  "RANGAREDDY": { N: 60, P: 32, K: 36, temperature: 28, humidity: 63, ph: 6.7, rainfall: 850 },
  "MEDAK": { N: 62, P: 33, K: 37, temperature: 27, humidity: 60, ph: 6.8, rainfall: 900 },
  "NIZAMABAD": { N: 63, P: 33, K: 37, temperature: 27, humidity: 61, ph: 6.9, rainfall: 950 },
  "KARIMNAGAR": { N: 64, P: 34, K: 38, temperature: 27, humidity: 62, ph: 6.8, rainfall: 1000 },
  "WARANGAL": { N: 63, P: 33, K: 37, temperature: 28, humidity: 60, ph: 6.8, rainfall: 950 },
  "KHAMMAM": { N: 62, P: 33, K: 37, temperature: 28, humidity: 65, ph: 6.7, rainfall: 1050 },
  "NALGONDA": { N: 61, P: 32, K: 36, temperature: 28, humidity: 63, ph: 6.7, rainfall: 850 },
  
  // Kerala
  "THIRUVANANTHAPURAM": { N: 52, P: 28, K: 32, temperature: 28, humidity: 78, ph: 6.0, rainfall: 1800 },
  "KOLLAM": { N: 53, P: 28, K: 32, temperature: 28, humidity: 79, ph: 6.1, rainfall: 2800 },
  "PATHANAMTHITTA": { N: 54, P: 29, K: 33, temperature: 27, humidity: 77, ph: 6.1, rainfall: 2900 },
  "ALAPPUZHA": { N: 53, P: 28, K: 32, temperature: 28, humidity: 80, ph: 6.0, rainfall: 2800 },
  "KOTTAYAM": { N: 54, P: 29, K: 33, temperature: 27, humidity: 78, ph: 6.1, rainfall: 2800 },
  "IDUKKI": { N: 55, P: 29, K: 33, temperature: 22, humidity: 75, ph: 6.2, rainfall: 3500 },
  "ERNAKULAM": { N: 53, P: 28, K: 32, temperature: 28, humidity: 78, ph: 6.0, rainfall: 3000 },
  "THRISSUR": { N: 54, P: 29, K: 33, temperature: 28, humidity: 77, ph: 6.1, rainfall: 3000 },
  "PALAKKAD": { N: 56, P: 30, K: 34, temperature: 28, humidity: 72, ph: 6.2, rainfall: 2500 },
  
  // Odisha
  "CUTTACK": { N: 68, P: 36, K: 40, temperature: 28, humidity: 76, ph: 6.4, rainfall: 1500 },
  "PURI": { N: 67, P: 35, K: 39, temperature: 28, humidity: 78, ph: 6.3, rainfall: 1450 },
  "GANJAM": { N: 66, P: 35, K: 39, temperature: 28, humidity: 75, ph: 6.4, rainfall: 1300 },
  "BALESWAR": { N: 69, P: 36, K: 40, temperature: 27, humidity: 77, ph: 6.5, rainfall: 1600 },
  "SAMBALPUR": { N: 67, P: 35, K: 39, temperature: 28, humidity: 68, ph: 6.6, rainfall: 1400 },
  "MAYURBHANJ": { N: 68, P: 36, K: 40, temperature: 27, humidity: 74, ph: 6.5, rainfall: 1550 },
  "KHURDA": { N: 67, P: 35, K: 39, temperature: 28, humidity: 76, ph: 6.4, rainfall: 1500 },
  "KENDRAPARA": { N: 68, P: 36, K: 40, temperature: 28, humidity: 78, ph: 6.3, rainfall: 1650 },
  
  // Bihar
  "PATNA": { N: 73, P: 38, K: 42, temperature: 26, humidity: 72, ph: 6.7, rainfall: 1200 },
  "GAYA": { N: 72, P: 37, K: 41, temperature: 27, humidity: 70, ph: 6.8, rainfall: 1100 },
  "BHAGALPUR": { N: 74, P: 38, K: 42, temperature: 26, humidity: 73, ph: 6.6, rainfall: 1150 },
  "MUZAFFARPUR": { N: 75, P: 39, K: 43, temperature: 26, humidity: 74, ph: 6.7, rainfall: 1250 },
  "DARBHANGA": { N: 76, P: 39, K: 43, temperature: 26, humidity: 75, ph: 6.6, rainfall: 1300 },
  "PURNIA": { N: 75, P: 39, K: 43, temperature: 26, humidity: 76, ph: 6.5, rainfall: 1400 },
  "ARRAH": { N: 73, P: 38, K: 42, temperature: 27, humidity: 71, ph: 6.8, rainfall: 1150 },
  "BEGUSARAI": { N: 74, P: 38, K: 42, temperature: 26, humidity: 73, ph: 6.7, rainfall: 1200 },
  "KATIHAR": { N: 75, P: 39, K: 43, temperature: 26, humidity: 76, ph: 6.6, rainfall: 1350 },
  
  // Jharkhand
  "RANCHI": { N: 66, P: 35, K: 39, temperature: 24, humidity: 68, ph: 6.4, rainfall: 1400 },
  "DHANBAD": { N: 68, P: 36, K: 40, temperature: 26, humidity: 70, ph: 6.5, rainfall: 1300 },
  "JAMSHEDPUR": { N: 67, P: 35, K: 39, temperature: 27, humidity: 69, ph: 6.4, rainfall: 1350 },
  "BOKARO": { N: 68, P: 36, K: 40, temperature: 26, humidity: 70, ph: 6.5, rainfall: 1300 },
  "GIRIDIH": { N: 67, P: 35, K: 39, temperature: 26, humidity: 68, ph: 6.5, rainfall: 1250 },
  "HAZARIBAGH": { N: 66, P: 35, K: 39, temperature: 25, humidity: 67, ph: 6.4, rainfall: 1300 },
  "DEOGHAR": { N: 68, P: 36, K: 40, temperature: 26, humidity: 69, ph: 6.5, rainfall: 1350 },
  "PALAMU": { N: 65, P: 34, K: 38, temperature: 26, humidity: 66, ph: 6.6, rainfall: 1150 },
  
  // Assam
  "KAMRUP": { N: 70, P: 37, K: 41, temperature: 25, humidity: 80, ph: 6.2, rainfall: 1800 },
  "NAGAON": { N: 71, P: 37, K: 41, temperature: 25, humidity: 81, ph: 6.3, rainfall: 1850 },
  "SONITPUR": { N: 69, P: 36, K: 40, temperature: 25, humidity: 79, ph: 6.2, rainfall: 2200 },
  "BARPETA": { N: 70, P: 37, K: 41, temperature: 25, humidity: 80, ph: 6.2, rainfall: 1750 },
  "DARRANG": { N: 69, P: 36, K: 40, temperature: 25, humidity: 79, ph: 6.3, rainfall: 1900 },
  "DIBRUGARH": { N: 72, P: 38, K: 42, temperature: 24, humidity: 82, ph: 6.1, rainfall: 2800 },
  "JORHAT": { N: 71, P: 37, K: 41, temperature: 24, humidity: 81, ph: 6.2, rainfall: 2400 },
  "SIVASAGAR": { N: 71, P: 37, K: 41, temperature: 24, humidity: 81, ph: 6.2, rainfall: 2300 },
  
  // Chhattisgarh
  "RAIPUR": { N: 64, P: 34, K: 38, temperature: 27, humidity: 64, ph: 6.6, rainfall: 1300 },
  "DURG": { N: 65, P: 34, K: 38, temperature: 27, humidity: 65, ph: 6.7, rainfall: 1250 },
  "BILASPUR CHHATTISGARH": { N: 63, P: 33, K: 37, temperature: 26, humidity: 63, ph: 6.7, rainfall: 1400 },
  "KORBA": { N: 64, P: 34, K: 38, temperature: 27, humidity: 64, ph: 6.6, rainfall: 1350 },
  "RAJNANDGAON": { N: 65, P: 34, K: 38, temperature: 27, humidity: 66, ph: 6.7, rainfall: 1300 },
  "RAIGARH": { N: 63, P: 33, K: 37, temperature: 27, humidity: 62, ph: 6.8, rainfall: 1400 },
  "SURGUJA": { N: 62, P: 33, K: 37, temperature: 25, humidity: 65, ph: 6.5, rainfall: 1500 },
  "BASTAR": { N: 61, P: 32, K: 36, temperature: 26, humidity: 70, ph: 6.4, rainfall: 1600 },
  
  // Uttarakhand
  "DEHRADUN": { N: 75, P: 39, K: 43, temperature: 22, humidity: 70, ph: 6.8, rainfall: 2100 },
  "HARIDWAR": { N: 76, P: 40, K: 44, temperature: 24, humidity: 68, ph: 7.0, rainfall: 1500 },
  "UDHAM SINGH NAGAR": { N: 78, P: 40, K: 45, temperature: 24, humidity: 69, ph: 7.1, rainfall: 1600 },
  "NAINITAL": { N: 74, P: 39, K: 43, temperature: 20, humidity: 72, ph: 6.7, rainfall: 2300 },
  "PAURI GARHWAL": { N: 73, P: 38, K: 42, temperature: 21, humidity: 68, ph: 6.8, rainfall: 1800 },
  "TEHRI GARHWAL": { N: 72, P: 38, K: 42, temperature: 20, humidity: 70, ph: 6.7, rainfall: 2000 },
  "ALMORA": { N: 73, P: 38, K: 42, temperature: 19, humidity: 71, ph: 6.7, rainfall: 1900 },
  
  // Himachal Pradesh
  "SHIMLA": { N: 70, P: 37, K: 41, temperature: 16, humidity: 65, ph: 6.5, rainfall: 1500 },
  "KANGRA": { N: 72, P: 38, K: 42, temperature: 18, humidity: 68, ph: 6.6, rainfall: 2500 },
  "MANDI": { N: 71, P: 37, K: 41, temperature: 19, humidity: 66, ph: 6.6, rainfall: 1800 },
  "HAMIRPUR": { N: 73, P: 38, K: 42, temperature: 20, humidity: 67, ph: 6.7, rainfall: 1600 },
  "UNA": { N: 74, P: 39, K: 43, temperature: 22, humidity: 68, ph: 6.8, rainfall: 1400 },
  "BILASPUR HP": { N: 72, P: 38, K: 42, temperature: 20, humidity: 67, ph: 6.7, rainfall: 1500 },
  "SOLAN": { N: 71, P: 37, K: 41, temperature: 19, humidity: 66, ph: 6.6, rainfall: 1700 },
  "KULLU": { N: 69, P: 36, K: 40, temperature: 17, humidity: 65, ph: 6.5, rainfall: 1200 },
  
  // Default fallback values
  "DEFAULT": { N: 70, P: 35, K: 40, temperature: 25, humidity: 65, ph: 6.8, rainfall: 900 }
};

export const getDistrictDefaults = (state: string, district: string): DistrictDefaults => {
  const upperDistrict = district.toUpperCase();
  return districtDefaults[upperDistrict] || districtDefaults["DEFAULT"];
};

export const getAllStates = (): string[] => {
  return Object.keys(stateDistrictMap);
};

export const getStateDistricts = (state: string): string[] => {
  return stateDistrictMap[state] || [];
};
