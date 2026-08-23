export interface StateDistrictMap {
  [state: string]: string[];
}

export const INDIAN_STATES_AND_DISTRICTS: StateDistrictMap = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Changlang", "Dibang Valley", "East Kameng", "East Siang", "Itanagar", "Kurung Kumey", "Lohit", "Papum Pare", "Tawang", "Tirap", "West Kameng", "West Siang"],
  "Assam": ["Baksa", "Barpeta", "Cachar", "Darrang", "Dibrugarh", "Guwahati", "Jorhat", "Kamrup", "Nagaon", "Silchar", "Sonitpur", "Tinsukia"],
  "Bihar": ["Bhagalpur", "Darbhanga", "Gaya", "Muzaffarpur", "Nalanda", "Patna", "Purnia", "Rohtas", "Samastipur", "Saran", "Vaishali"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Bilaspur", "Durg", "Jagdalpur", "Korba", "Raigarh", "Raipur", "Rajnandgaon"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Kutch", "Mehsana", "Rajkot", "Surat", "Vadodara"],
  "Haryana": ["Ambala", "Faridabad", "Gurugram", "Hisar", "Jhajjar", "Karnal", "Kurukshetra", "Panipat", "Rewari", "Rohtak", "Sonipat"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kullu", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jammu and Kashmir": ["Anantnag", "Baramulla", "Jammu", "Kathua", "Pulwama", "Srinagar", "Udhampur"],
  "Jharkhand": ["Bokaro", "Dhanbad", "Dumka", "Hazaribagh", "Jamshedpur", "Ranchi"],
  "Karnataka": ["Bangalore Urban", "Bangalore Rural", "Belgaum", "Bellary", "Bidar", "Dakshina Kannada", "Dharwad", "Gulbarga", "Mysore", "Shimoga", "Tumkur", "Udupi"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kochi", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Thiruvananthapuram", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Gwalior", "Indore", "Jabalpur", "Katni", "Rewa", "Sagar", "Satna", "Ujjain"],
  "Maharashtra": ["Ahmednagar", "Aurangabad", "Kolhapur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nashik", "Navi Mumbai", "Pune", "Solapur", "Thane"],
  "Odisha": ["Balasore", "Bhadrak", "Bhubaneswar", "Cuttack", "Ganjam", "Puri", "Rourkela", "Sambalpur"],
  "Punjab": ["Amritsar", "Bathinda", "Faridkot", "Hoshiarpur", "Jalandhar", "Ludhiana", "Mohali", "Patiala"],
  "Rajasthan": ["Ajmer", "Alwar", "Bikaner", "Jaipur", "Jodhpur", "Kota", "Sikar", "Udaipur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Erode", "Madurai", "Salem", "Thanjavur", "Tiruchirappalli", "Tirunelveli", "Vellore"],
  "Telangana": ["Hyderabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nalgonda", "Nizamabad", "Rangareddy", "Warangal"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ayodhya", "Bareilly", "Ghaziabad", "Gorakhpur", "Jhansi", "Kanpur", "Lucknow", "Mathura", "Meerut", "Moradabad", "Noida", "Prayagraj", "Varanasi"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Rishikesh", "Roorkee", "Rudrapur"],
  "West Bengal": ["Asansol", "Darjeeling", "Durgapur", "Howrah", "Kolkata", "Nadia", "North 24 Parganas", "Siliguri", "South 24 Parganas"]
};

export const INDIAN_STATES = Object.keys(INDIAN_STATES_AND_DISTRICTS).sort();
