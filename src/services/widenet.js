'use strict'

import fetchDefault from 'node-fetch'
import ServiceError from '../errors/service.js'

export default function fetchWideNetService(cepWithLeftPad, configurations) {
  const cepWithDash = `${cepWithLeftPad.slice(0, 5)}-${cepWithLeftPad.slice(5)}`
  const url = `https://cdn.apicep.com/file/apicep/${cepWithDash}.json`
  const options = {
    method: 'GET',
    mode: 'cors',
    headers: {
      accept: 'application/json'
    },
    timeout: configurations.timeout || 30000
  }

  const fetch = configurations.fetch || fetchDefault

  return fetch(url, options)
    .then(analyzeAndParseResponse)
    .then(checkForWideNetError)
    .then(extractCepValuesFromResponse)
    .catch(throwApplicationError)
}

function analyzeAndParseResponse(response) {
  if (response.ok) {
    return response.json()
  }

  throw Error('Erro ao se conectar com o serviço WideNet.')
}

function checkForWideNetError(object) {
  if (object.ok === false || object.status !== 200) {
    throw new Error('CEP não encontrado na base do WideNet.')
  }

  return object
}

function extractCepValuesFromResponse(object) {
  return {
    cep: object.code.replace('-', ''),
    state: object.state,
    city: object.city,
    neighborhood: object.district,
    street: object.address,
    service: 'widenet'
  }
}

function throwApplicationError(error) {
  const serviceError = new ServiceError({
    message: error.message,
    service: 'widenet'
  })

  if (error.name === 'FetchError') {
    serviceError.message = 'Erro ao se conectar com o serviço WideNet.'
  }

  throw serviceError
}
