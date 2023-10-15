import axios from 'axios'

const YOUR_IP_MACHINE = '192.168.2.122'

export const api = axios.create({
  baseURL: `http://${YOUR_IP_MACHINE}:3333`
})