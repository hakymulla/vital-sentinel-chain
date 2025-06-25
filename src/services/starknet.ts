import { Contract, RpcProvider, CallData, num } from 'starknet';

const STARKNET_RPC_URL = 'https://starknet-sepolia.public.blastapi.io';
const CONTRACT_ADDRESS = '0x05059db56546b5bcae28335752121f741d0e439aab471a751711e6c3923ddd51';

// ABI for the health contract functions
const CONTRACT_ABI = [
  {
    name: 'get_latest_vitals',
    type: 'function',
    inputs: [
      {
        name: 'user',
        type: 'felt252'
      }
    ],
    outputs: [
      {
        name: 'date',
        type: 'felt252'
      },
      {
        name: 'steps',
        type: 'u32'
      },
      {
        name: 'calories_burned',
        type: 'u32'
      },
      {
        name: 'distance_km',
        type: 'u32'
      },
      {
        name: 'sleep_hours',
        type: 'u32'
      },
      {
        name: 'heart_rate_avg',
        type: 'u32'
      },
      {
        name: 'blood_oxygen_avg',
        type: 'u32'
      },
      {
        name: 'body_temperature_c',
        type: 'u32'
      },
      {
        name: 'prediction_heart_rate',
        type: 'felt252'
      },
      {
        name: 'prediction_blood_oxygen',
        type: 'felt252'
      },
      {
        name: 'prediction_temperature',
        type: 'felt252'
      }
    ],
    state_mutability: 'view'
  },
  {
    name: 'submit_vitals',
    type: 'function',
    inputs: [
      {
        name: 'user',
        type: 'felt252'
      },
      {
        name: 'date',
        type: 'felt252'
      },
      {
        name: 'steps',
        type: 'u32'
      },
      {
        name: 'calories_burned',
        type: 'u32'
      },
      {
        name: 'distance_km',
        type: 'u32'
      },
      {
        name: 'sleep_hours',
        type: 'u32'
      },
      {
        name: 'heart_rate_avg',
        type: 'u32'
      },
      {
        name: 'blood_oxygen_avg',
        type: 'u32'
      },
      {
        name: 'body_temperature_c',
        type: 'u32'
      },
      {
        name: 'prediction_heart_rate',
        type: 'felt252'
      },
      {
        name: 'prediction_blood_oxygen',
        type: 'felt252'
      },
      {
        name: 'prediction_temperature',
        type: 'felt252'
      }
    ],
    outputs: [],
    state_mutability: 'external'
  }
];

export class StarkNetHealthService {
  private provider: RpcProvider;
  private contract: Contract;

  constructor() {
    this.provider = new RpcProvider({ nodeUrl: STARKNET_RPC_URL });
    this.contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, this.provider);
  }

  // async getLatestVitals(userFelt: string) {
  //   try {
  //     console.log('Fetching latest vitals for user:', userFelt);
  //     console.log('userFelt char codes:', Array.from(userFelt).map(c => c.charCodeAt(0)));
  //     // Defensive: trim whitespace
  //     userFelt = userFelt.trim();
  //     // let userParam;
  //     // if (userFelt.startsWith('0x')) {
  //     //   userParam = num.toBigInt(userFelt).toString();
  //     // } else if (/^\d+$/.test(userFelt)) {
  //     //   userParam = userFelt;
  //     // } else {
  //     //   console.error('Invalid userFelt format:', userFelt);
  //     //   throw new Error('Invalid userFelt format: ' + userFelt);
  //     // }
  //     let userParam = userFelt.trim();
  //     console.log('userParam sent to contract:', userParam);
  //     const result = await this.contract.call('get_latest_vitals', [userParam]);
  //     console.log('Raw contract result:', result);
  //     return {
  //       date: result[0],
  //       steps: Number(result[1]),
  //       caloriesBurned: Number(result[2]),
  //       distanceKm: Number(result[3]),
  //       sleepHours: Number(result[4]),
  //       heartRateAvg: Number(result[5]),
  //       bloodOxygenAvg: Number(result[6]),
  //       bodyTemperatureC: Number(result[7]),
  //       predictionHeartRate: result[8],
  //       predictionBloodOxygen: result[9],
  //       predictionTemperature: result[10]
  //     };
  //   } catch (error) {
  //     console.error('Error fetching vitals from StarkNet:', error);
  //     throw error;
  //   }
  // }

  async getLatestVitals(user: string) {
    // const contract = new Contract(abi, contractAddress, provider);
  
    // const result = await this.contract.call('get_latest_vitals', [user]);
    const myCall = this.contract.populate('get_latest_vitals', ['0x123']);

    const result = await this.contract.get_latest_vitals(myCall.calldata);

    console.log('Raw contract result:', result.distance_km);
    return {
        date: result.date,
        steps: Number(result.steps),
        caloriesBurned: Number(result.calories_burned),
        distanceKm: Number(result.distance_km),
        sleepHours: Number(result.sleep_hours),
        heartRateAvg: Number(result.heart_rate_avg),
        bloodOxygenAvg: Number(result.blood_oxygen_avg),
        bodyTemperatureC: Number(result.body_temperature_c),
        predictionHeartRate: result.prediction_heart_rate,
        predictionBloodOxygen: result.prediction_blood_oxygen,
        predictionTemperature: result.prediction_temperature
    };
  };

  convertToHealthVitals(starknetData: any) {
    return {
      heartRate: starknetData.heartRateAvg || 0,
      bloodOxygen: starknetData.bloodOxygenAvg ? starknetData.bloodOxygenAvg / 10 : 0,
      temperature: starknetData.bodyTemperatureC ? starknetData.bodyTemperatureC / 100 : 0, // Convert from celsius * 10
      timestamp: Date.now(),
      deviceId: 'starknet_contract'
    };
  }
}

export const starknetService = new StarkNetHealthService();
