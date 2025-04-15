"use client";
import React, { useState, useRef } from "react";
import { ArrowRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout/layout";

// Define a type for our glossary items
type GlossaryItem = {
  term: string;
  letter: string;
  question: string;
  definition: string;
};

// Parse the glossary data
const glossaryData: GlossaryItem[] = [
  {
    term: "ADS-B",
    letter: "A",
    question: "What is ADS-B?",
    definition: "Automatic Dependent Surveillance-Broadcast (ADS-B) is a technology that allows uncrewed aerial vehicles (UAVs) to broadcast their position, speed, and altitude to other aircraft and traffic control. This enhances safety and coordination in airspace by helping to avoid collisions and informing controllers and pilots of nearby uncrewed operations.",
  },
  {
    term: "BVLOS",
    letter: "B",
    question: "What is BVLOS?",
    definition: "Beyond Visual Line of Sight (BVLOS) refers to drone operations where the drone flies beyond the visual range of the pilot. The pilot controls the drone using onboard cameras and navigation systems, rather than relying on visual observation, allowing for more versatile and far-reaching drone applications. As a result, aviation authorities like the Federal Aviation Administration (FAA) in the United States and other similar bodies worldwide have established specific regulations and requirements for performing BVLOS operations.",
  },
  {
    term: "C2 Link",
    letter: "C",
    question: "What is C2 Link?",
    definition: "The command and control (C2) link refers to the communications link between a UAV (uncrewed aerial vehicle) and its ground station, responsible for managing and controlling the UAV. C2 links are essential in drone operations where the aircraft is remotely piloted by a human or programmed to fly autonomously.",
  },
  {
    term: "CAAM",
    letter: "C",
    question: "What is CAAM?",
    definition: "The Civil Aviation Authority of Malaysia (CAAM) plays a key role in the development of Malaysia's civil aviation technical sector, including the drone industry. It ensures compliance with ICAO (International Civil Aviation Organization) standards, focusing on safe, secure, and efficient aviation practices. CAAM regulates drone operations, pilot certification, and airspace management, fostering responsible drone use across various applications.",
  },
  {
    term: "CAD Systems",
    letter: "C",
    question: "What is CAD Systems?",
    definition: "Computer Aided Dispatch (CAD) systems, crucial in the drone industry, especially for Drone as a First Responder (DFR) operations, enhance the management and deployment of drones. They facilitate efficient coordination in emergency responses, surveillance, and deliveries by integrating real-time data and communication tools, ensuring quick and effective mission execution.",
  },
  {
    term: "CONOPS",
    letter: "C",
    question: "What is CONOPS?",
    definition: "A Concept of Operations (CONOPS) document in the drone industry outlines how drone systems are used in specific operational environments. It details the roles of drones, user responsibilities, various flight and mission scenarios, as well as maintenance and support protocols, guiding stakeholders through the development, implementation, and usage stages.",
  },
  {
    term: "DAA",
    letter: "D",
    question: "What is DAA?",
    definition: "Detect and Avoid (DAA) in the drone industry refers to systems enabling drones to autonomously detect and evade obstacles or other aircraft. This technology ensures safe operation, particularly in Beyond Visual Line of Sight (BVLOS) flights, by preventing collisions and facilitating smoother integration into existing airspace.",
  },
  {
    term: "DFR",
    letter: "D",
    question: "What is DFR?",
    definition: "Drone as a First Responder (DFR) refers to the use of drones for immediate response in emergencies. Drones quickly reach incident scenes, provide real-time aerial data, and assist in assessing situations, aiding first responders in making informed decisions and enhancing the effectiveness and safety of emergency operations.",
  },
  {
    term: "DGCA",
    letter: "D",
    question: "What is DGCA?",
    definition: "The Directorate General of Civil Aviation (DGCA) is the regulatory body in the field of Civil Aviation, primarily dealing with safety issues. It is responsible for the regulation of air transport services to/from/within India and for the enforcement of civil air regulations, air safety, and airworthiness standards.",
  },
  {
    term: "DiaB",
    letter: "D",
    question: "What is DiaB?",
    definition: "Drone in a Box (DiaB) represents a fully autonomous drone solution, housed in a protective enclosure. It supports automated deployment for missions like surveillance and inspection, with minimal human intervention. Featuring self-charging and remote operation capabilities, DiaB systems enhance continuous, autonomous functioning in diverse industries and applications.",
  },
  {
    term: "EASA",
    letter: "E",
    question: "What is EASA?",
    definition: "The European Union Aviation Safety Agency (EASA) ensures the safety of air travel in Europe. It certifies, regulates, and sets standards for aviation, investigates incidents, and collaborates globally on safety measures.",
  },
  {
    term: "EVLOS",
    letter: "E",
    question: "What is EVLOS?",
    definition: "Extended Visual Line of Sight (EVLOS) in drone operations allows flying beyond the pilot's immediate view but within an observer's sight, expanding operational range while maintaining visual safety. Unlike Beyond Visual Line of Sight (BVLOS), which involves no direct visual contact, EVLOS still relies on human observation for situational awareness and safety.",
  },
  {
    term: "FAA",
    letter: "F",
    question: "What is FAA?",
    definition: "The Federal Aviation Administration (FAA) is the U.S. governmental body that regulates all aspects of civil aviation, including drone operations. It sets rules for drone usage, pilot certification, and airspace management to ensure safety and compliance in both commercial and recreational drone activities.",
  },
  {
    term: "FPV",
    letter: "F",
    question: "What is FPV?",
    definition: "First Person View (FPV) in drones offers unique advantages for enterprise applications. Its immersive, real-time visual feedback aids precise maneuvering in complex environments, essential for industrial inspections and surveillance. FPV enhances situational awareness and provides detailed perspectives for aerial photography and surveying, leading to more accurate and efficient outcomes.",
  },
  {
    term: "GCAA",
    letter: "G",
    question: "What is GCAA?",
    definition: "The General Civil Aviation Authority (GCAA) is a regulatory body responsible for overseeing civil aviation in a specific region or country. It ensures safety, security, and compliance with aviation regulations within its jurisdiction.",
  },
  {
    term: "GDPR",
    letter: "G",
    question: "What is GDPR?",
    definition: "The General Data Protection Regulation (GDPR) is legislation that updates and unifies data privacy laws across the European Union (EU).",
  },
  {
    term: "GIS",
    letter: "G",
    question: "What is GIS?",
    definition: "Geographic Information System (GIS) is a computer system that captures, stores, verifies, and displays data about positions on the earth's surface. In the drone industry, drones collect geospatial data that is analyzed and visualized using GIS software. This combination enables detailed mapping, terrain analysis, and environmental monitoring. It's particularly useful in urban planning, agriculture, conservation, and infrastructure management, providing critical insights into these fields.",
  },
  {
    term: "GPS",
    letter: "G",
    question: "What is GPS?",
    definition: "Global Positioning Satellites (GPS) is a network of satellites orbiting Earth to provide precise location information. Drones use GPS signals to determine their location, altitude, and direction, enabling stable flight and accurate data collection for tasks like mapping, surveying, and tracking, and ensuring reliable operations in various applications.",
  },
  {
    term: "GTSA",
    letter: "G",
    question: "What is GTSA?",
    definition: "Go to Safe Altitude (GTSA) is a command or procedure instructing a vehicle, often a drone or aircraft, to ascend to a predetermined and safe flying height. This is done to avoid collisions or hazards. This function is crucial in complex environments, as it ensures drones maintain a safe distance from obstacles, thus enhancing operational safety and reliability.",
  },
  {
    term: "H.V.A.C",
    letter: "H",
    question: "What is H.V.A.C?",
    definition: "Heating, Ventilation, and Air Conditioning (H.V.A.C) systems in docking stations are crucial for regulating temperature and air quality. They maintain optimal conditions for drone storage and charging, ensuring electronic components function reliably and prolonging the lifespan of the drones housed within these stations.",
  },
  {
    term: "HMS",
    letter: "H",
    question: "What is HMS?",
    definition: "The Health Management System (HMS) provides continuous monitoring of the health of both drones and docks, offering real-time notifications in case of any abnormalities. This system is crucial in maintaining the airworthiness and operational reliability of both drones and docks, enabling effective maintenance and ensuring safety.",
  },
  {
    term: "ISO",
    letter: "I",
    question: "What is ISO?",
    definition: "The International Organization for Standardization (ISO) develops and publishes international standards across various fields, promoting quality, safety, and efficiency. This includes software design, development, maintenance, and quality assurance for drone systems. Adhering to these standards ensures that drone software is reliable, secure, and efficient, enhancing overall system performance and safety. This comprehensive approach to standardization helps maintain consistency and trust in the rapidly evolving drone market.",
  },
  {
    term: "JCAB",
    letter: "J",
    question: "What is JCAB?",
    definition: "The Japan Civil Aviation Bureau (JCAB) oversees air travel safety in Japan, operating under the Ministry of Land, Infrastructure, Transport and Tourism. It investigates incidents and regulates aviation aspects such as airports, aircraft, and pilots.",
  },
  {
    term: "KML",
    letter: "K",
    question: "What is KML?",
    definition: "Keyhole Markup Language (KML), is an XML-based file format used for displaying geographic data. It is useful in mapping and visualizing flight paths, waypoints, and terrain, aiding efficient mission planning and analysis in various applications.",
  },
  {
    term: "KMZ",
    letter: "K",
    question: "What is KMZ?",
    definition: "Keyhole Markup Language Zipped (KMZ), is essentially a compressed version of a KML file. Both KML and KMZ files are often used for mapping and defining flight paths. KMZ files are smaller and easier to distribute because they contain all the necessary data in one package.",
  },
  {
    term: "LIDAR",
    letter: "L",
    question: "What is LIDAR?",
    definition: "Light Detection and Ranging (LIDAR) is a remote sensing method used to examine the surface of the Earth. It works by emitting laser light toward the ground and measuring the time it takes for the light to bounce back to the sensor. This time, combined with the speed of light, is used to calculate the distance between the sensor and the ground. Drones equipped with LIDAR sensors emit laser pulses to measure distances to the ground, creating high-resolution 3D maps of landscapes, infrastructure, and vegetation, vital for various analytical and planning purposes.",
  },
  {
    term: "MSDK",
    letter: "M",
    question: "What is MSDK?",
    definition: "A Mobile Software Development Kit (MSDK) is a software package equipped with tools, libraries, documents, code samples, guides, and APIs designed to build and enhance platform-specific mobile applications. The DJI MSDK, standing for DJI's Mobile Software Development Kit, is a specialized version for developers to access the capabilities of DJI's aircraft and handheld camera products. It provides the necessary resources for creating mobile applications and integrating features specific to DJI's technology, making it a comprehensive toolkit for drone-related mobile app development.",
  },
  {
    term: "NFZ",
    letter: "N",
    question: "What is NFZ?",
    definition: "No Fly Zones (NFZ) are predefined geographic areas where drone operations are prohibited or restricted due to safety, security, or privacy concerns.",
  },
  {
    term: "OODA Loop",
    letter: "O",
    question: "What is OODA Loop?",
    definition: "Autonomous drones in the drone industry utilize the Observe, Orient, Decide, Act (OODA) loop for decision-making. This loop helps drones to continuously observe their environment, orient themselves based on data, decide the best course of action, and then act on it, enabling efficient and independent operation.",
  },
  {
    term: "OSDK",
    letter: "O",
    question: "What is OSDK?",
    definition: "Onboard Software Development Kit (OSDK) is an essential tool in advanced drone applications, particularly in enhancing the capabilities of Drone in a Box (DiaB) systems. When integrated with modules like the Nvidia Jetson Nano, the OSDK allows for more sophisticated control and data processing directly on the drone. Such integration is key to extending the capabilities and performance of drones in various flight operations.",
  },
  {
    term: "PL",
    letter: "P",
    question: "What is PL?",
    definition: "Precision Landing (PL) is a feature that enables drones to land on a docking station's landing pad with high precision, using ArUco marker tags for visual guidance. This ensures safe landings at docking stations, avoiding collisions or damage.",
  },
  {
    term: "PPK",
    letter: "P",
    question: "What is PPK?",
    definition: "Post-processed Kinematics (PPK) in the drone industry is a technology that improves the positioning accuracy of drone-captured images. It combines data from a base station and the drone, aligning them after the flight, which results in more precise location information for the images captured during the drone's mission.",
  },
  {
    term: "PSDK",
    letter: "P",
    question: "What is PSDK?",
    definition: "The DJI Payload Software Development Kit (PSDK) is a specialized toolkit for customizing and controlling payloads on DJI drones, like cameras and sensors. It empowers developers to effectively integrate and manage these payloads, significantly enhancing the capabilities of DJI drones for specialized tasks across various applications including surveillance, mapping, and inspection.",
  },
  {
    term: "RPIC",
    letter: "R",
    question: "What is RPIC?",
    definition: "A Remote Pilot in Command (RPIC) is an individual selected by the drone operator to oversee and ensure the safe management of a drone flight. This role includes responsibility for all aspects of the flight, from adherence to safety procedures to compliance with regulations during the operation.",
  },
  {
    term: "RTDS",
    letter: "R",
    question: "What is RTDS?",
    definition: "Return to Docking Station (RTDS) is an action that instructs the drone to return to its docking station at the set RTDS speed and altitude.",
  },
  {
    term: "RTH-PL",
    letter: "R",
    question: "What is RTH-PL?",
    definition: "Return to Home - Precision Landing (RTH-PL) is a feature that guides drones back to their take-off point or docking station and ensures they land accurately and safely.",
  },
  {
    term: "RTK-PL",
    letter: "R",
    question: "What is RTK-PL?",
    definition: "Real Time Kinematics - Precision Landing (RTK-PL) uses RTK satellite technology to enable drones to land with centimeter-level accuracy. This precision is crucial for exact positioning in various operations. Some docking stations, like the DJI Dock, come with built-in RTK ground stations, whereas others may require external systems like DRTK 2 ground stations or NTRIP (Network Transport Protocol for Real-Time Intelligent Transportation Systems) networks for connecting to RTK satellites.",
  },
  {
    term: "RTK",
    letter: "R",
    question: "What is RTK?",
    definition: "Real Time Kinematics (RTK) in the drone industry is a satellite navigation technique that provides high-accuracy positioning data, essential for precise drone navigation and landing. By leveraging signals from RTK satellites, drones achieve centimeter-level accuracy in tasks like surveying, mapping, agriculture, and construction, greatly enhancing their precision.",
  },
  {
    term: "RTSL",
    letter: "R",
    question: "What is RTSL?",
    definition: "Return to Safe Location (RTSL) is a command for drones to return to a predetermined safe location, crucial in DiaB (Drone-in-a-Box) operations. It's typically triggered automatically or manually in emergencies or risky situations. When a drone's failsafe is set to RTSL, it performs this action to ensure safety.",
  },
  {
    term: "SOC-2",
    letter: "S",
    question: "What is SOC-2?",
    definition: "Service Organization Control 2 (SOC 2) is a security standard that ensures data protection. In the context of drone operations, SOC 2 is essential for software, guaranteeing secure handling of sensitive information. This compliance safeguards data integrity, enhancing trust and reliability in drone services that handle critical data.",
  },
  {
    term: "SORA",
    letter: "S",
    question: "What is SORA?",
    definition: "Specific Operations Risk Assessment (SORA) is a multi-stage process of risk assessment aiming at risk analysis of certain uncrewed aircraft operations, as well as defining necessary mitigations and operational safety objectives and their required level of robustness.",
  },
  {
    term: "SSO",
    letter: "S",
    question: "What is SSO?",
    definition: "Single Sign On (SSO) is a technology that combines several different application login screens into one. With SSO, a user only has to enter their login credentials (username, password, etc.) one time on a single page to access all of their SaaS applications. Google SSO and Microsoft SSO are examples of Single Sign-On solutions commonly integrated into web applications.",
  },
  {
    term: "UAV",
    letter: "U",
    question: "What is UAV?",
    definition: "An uncrewed aerial vehicle (UAV) is an aircraft that flies without a human pilot on board. It is controlled either remotely or by itself using technology like sensors, GPS, and communication systems. UAVs are used for different tasks, including surveillance, collecting data, and even firefighting, helping professionals understand and manage situations safely from afar.",
  },
  {
    term: "UTM",
    letter: "U",
    question: "What is UTM?",
    definition: "Uncrewed Aircraft System Traffic Management (UTM) is a system designed to safely integrate drones into the airspace. It manages drone traffic, coordinates flight paths, and ensures safety for both uncrewed and manned aircraft. UTM is essential in crowded skies, especially in urban areas, for efficient and conflict-free drone operations.",
  },
  {
    term: "VLOS",
    letter: "V",
    question: "What is VLOS?",
    definition: "Visual Line of Sight (VLOS) involves piloting a drone while keeping it within direct, unaided sight. This contrasts with Beyond Visual Line of Sight (BVLOS), where the drone operates beyond the pilot's visual range, often relying on technology for navigation. Extended Visual Line of Sight (EVLOS) is a middle ground, where the drone flies outside the pilot's direct view but within an observer's sight, who communicates with the pilot.",
  },
  {
    term: "VMS",
    letter: "V",
    question: "What is VMS?",
    definition: "A Video Management System (VMS) is a blend of software and hardware that connects to drones' cameras, alarms, and sensors. This integration allows security teams to effectively monitor and respond to potential threats or incidents, utilizing the aerial perspective and mobility of drones for enhanced surveillance.",
  },
  {
    term: "WPML",
    letter: "W",
    question: "What is WPML?",
    definition: "WayPoint Markup Language (WPML) is a standard format for drone route files, used to represent flight paths. It provides a set of navigation instructions, similar to KML, for drone systems. These files, essential in planning drone routes, use the '.kmz' file extension.",
  },
];

// Get all unique letters
const uniqueLetters = Array.from(new Set(glossaryData.map(item => item.letter)));

const GlossaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLetters, setActiveLetters] = useState<string[]>(uniqueLetters);
  
  // Refs for smooth scrolling
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Filter data based on search
  const filteredData = searchTerm
    ? glossaryData.filter(
        (item) =>
          item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.definition.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : glossaryData;

  const scrollToSection = (letter: string) => {
    const element = sectionRefs.current[letter];
    if (element) {
      const yOffset = -100; // Adjust for header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  // Filter active letters based on search results
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value) {
      const matchingItems = glossaryData.filter(
        (item) =>
          item.term.toLowerCase().includes(value.toLowerCase()) ||
          item.definition.toLowerCase().includes(value.toLowerCase())
      );
      const matchingLetters = Array.from(new Set(matchingItems.map(item => item.letter)));
      setActiveLetters(matchingLetters);
    } else {
      setActiveLetters(uniqueLetters);
    }
  };

  return (
      <div className="bg-[#0B0B0B] min-h-screen text-white">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 md:px-0">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
                FlytBase <span className="text-yellow-400">Glossary</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10">
                Stay updated with drone terminologies with our glossary that goes beyond definitions.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto mb-12">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search terms or definitions..."
                  className="w-full py-3 pl-12 pr-4 bg-[#171717] border border-gray-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Alphabet Navigation */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
              {uniqueLetters.map((letter) => (
                <motion.button
                  key={letter}
                  onClick={() => scrollToSection(letter)}
                  className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full ${
                    activeLetters.includes(letter)
                      ? "bg-primary text-black"
                      : "bg-[#171717] text-gray-500"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!activeLetters.includes(letter)}
                >
                  {letter}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Glossary Content */}
        <section className="pb-24">
          <div className="container mx-auto max-w-5xl px-4">
            {activeLetters.map((letter) => {
              const letterItems = filteredData.filter(
                (item) => item.letter === letter
              );
              
              if (letterItems.length === 0) return null;
              
              return (
                <div 
                  key={letter}
                  ref={el => { sectionRefs.current[letter] = el }}
                  className="mb-12"
                >
                  <h2 className="text-3xl font-bold mb-6 border-b border-gray-800 pb-2">
                    {letter}
                  </h2>
                  <div className="space-y-8">
                    {letterItems.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-[#171717] p-6 rounded-lg border border-gray-800"
                      >
                        <h3 className="text-xl text-primary font-semibold mb-2">
                          {item.question}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {item.definition}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredData.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl text-gray-400">No matching terms found.</h3>
                <p className="text-gray-500 mt-2">Try a different search term.</p>
              </div>
            )}
          </div>
          
          {/* Back to top button */}
          <div className="flex justify-center mt-12">
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 bg-primary text-black py-2 px-5 rounded-full hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Back to Top</span>
              <ArrowRight className="h-4 w-4 transform rotate-[-90deg]" />
            </motion.button>
          </div>
        </section>
      </div>
  
  );
};

export default GlossaryPage;