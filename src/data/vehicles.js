
const states = [
  "UK", "UP", "DL", "HR", "PB",
  "HP", "RJ", "CH", "MH", "GJ"
];

const vehicleTypes = [
  "Car", "Bike", "Scooter", "Commercial"
];

const models = {
  Car: [
    "Sample Hatchback",
    "Sample Sedan",
    "Sample SUV",
    "Sample Compact SUV"
  ],
  Bike: [
    "Sample Motorcycle",
    "Sample Sports Bike",
    "Sample Commuter Bike"
  ],
  Scooter: [
    "Sample Scooter",
    "Sample Electric Scooter"
  ],
  Commercial: [
    "Sample Delivery Van",
    "Sample Mini Truck"
  ]
};

// Generate 500 unique fictional vehicle records
export const vehicles = Array.from(
  { length: 500 },
  (_, i) => {
    const state = states[i % states.length];

    const rto = String(
      (Math.floor(i / 10) % 99) + 1
    ).padStart(2, "0");

    const letter1 = String.fromCharCode(
      65 + Math.floor(i / 100)
    );

    const letter2 = String.fromCharCode(
      65 + (i % 26)
    );

    const series = `${letter1}${letter2}`;

    const lastFour = String(1000 + i);

    const vehicleType =
      vehicleTypes[i % vehicleTypes.length];

    return {
      id: i + 1,

      vehicleNumber:
        `${state}${rto}${series}${lastFour}`,

      vehicleType,

      vehicleModel:
        models[vehicleType][i % models[vehicleType].length],

      ownerReference:
        `OWN${String(i + 1).padStart(4, "0")}`,

      status: "Demo Verified"
    };
  }
);

// Dataset information
console.log("Total vehicles:", vehicles.length);


console.log("Total vehicles:", vehicles.length);

console.log(
  "Unique vehicle numbers:",
  new Set(vehicles.map(v => v.vehicleNumber)).size
);