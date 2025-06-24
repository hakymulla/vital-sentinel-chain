
import { Contract, RpcProvider, CallData } from 'starknet';

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

  async getLatestVitals(userFelt: string) {
    try {
      console.log('Fetching latest vitals for user:', userFelt);
      const result = await this.contract.get_latest_vitals(userFelt);
      
      return {
        date: result[0],
        steps: Number(result[1]),
        caloriesBurned: Number(result[2]),
        distanceKm: Number(result[3]),
        sleepHours: Number(result[4]),
        heartRateAvg: Number(result[5]),
        bloodOxygenAvg: Number(result[6]),
        bodyTemperatureC: Number(result[7]),
        predictionHeartRate: result[8],
        predictionBloodOxygen: result[9],
        predictionTemperature: result[10]
      };
    } catch (error) {
      console.error('Error fetching vitals from StarkNet:', error);
      throw error;
    }
  }

  convertToHealthVitals(starknetData: any) {
    return {
      heartRate: starknetData.heartRateAvg || 0,
      bloodOxygen: starknetData.bloodOxygenAvg || 0,
      temperature: starknetData.bodyTemperatureC ? starknetData.bodyTemperatureC / 10 : 0, // Convert from celsius * 10
      timestamp: Date.now(),
      deviceId: 'starknet_contract'
    };
  }
}

export const starknetService = new StarkNetHealthService();
