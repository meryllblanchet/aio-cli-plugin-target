/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const aioTargetLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-target', {provider: 'debug' })
const config = require ('@adobe/aio-lib-core-config')
const { Command, flags } = require('@oclif/command')
const { getToken, context } = require('@adobe/aio-lib-ims')
const sdk = require ('@adobe/aio-lib-target')
const { CLI } = require('@adobe/aio-lib-ims/src/context')
const Help = require('@oclif/plugin-help').default
const yaml = require('js-yaml')

class TargetCommand extends Command {
  async run() {
    const help = new Help(this.config)
    help.showHelp(['target', '--help'])
  }

  /**
   * Initializes Adobe Target SDK library
   */
  async initSdk() {
    await context.setCli({ '$cli.bare-output': true}, false)
    aioTargetLogger.debug('Retrieving Auth Token')
    this.accessToken = await getToken(CLI)
    this.targetClient = await sdk.init(config.get('target.tenant'), config.get('target.api_key'), this.accessToken)
  }

  /**
   * Output JSON data
   *
   * @param {object} data JSON data to print
   */
  printJson (data) {
    this.log(JSON.stringify(data))
  }

  /**
   * Output YAML data
   *
   * @param {object} data YAML data to print
   */
  printYaml (data) {
    // clean undefined values
    data = JSON.parse(JSON.stringify(data))
    this.log(yaml.safeDump(data, { noCompatMode: true }))
  }

  /**
   * print the current Adobe Target Config
   *
   * @param {object} [options] printOptions
   * @param {string} [options.alternativeFormat] can be set to: 'json', 'yml'
   */
  printTargetConfig (options = {}) {
    const config = {}
    config.tenant = this.getConfig('target.tenant')
    config.apiKey = this.getConfig('target.apikey')

    // handling json output
    if (options.alternativeFormat === 'json') {
      this.printJson(config)
      return
    }

    if (options.alternativeFormat === 'yml') {
      this.printYaml(config)
      return
    }

    this.log('You are currently using the following configuration:')
    this.log(`1. Adobe Target Tenant: ${config.tenant || '<no tenant configured>'}`)
    this.log(`2. Adobe Target API Key: ${config.apiKey || '<no apiKey configured>'}`)
  }

  /**
   * Lists Adobe Target offers
   *
   * @param {object} [options] listing options
   * @param {string} [options.limit] defines the number of offers to list. Default value is 2147483647
   * @param {string} [options.offset] defines the first offer to return from the list of total offers.
   * @param {string} [options.sortBy] defines the sorting criteria on the returned offers.
   */
  async listTargetOffers (options = null) {
    const response = await this.targetClient.getOffers(options)
    if (!response.ok) {
      throw new Error('Error retrieving offers')
    }
    return response.body
  }

  /**
   * Gets an Adobe Target offer
   *
   * @param {string} [id] the id of the Adobe Target offer to retrieve
   */
  async getTargetOffer (id = null) {
    const response = await this.targetClient.getOffer(id)
    if (!response.ok) {
      throw new Error(`Error retrieving the offer with id ${id}`)
    }
    return response.body
  }

  /**
   * Creates an Adobe Target offer
   *
   * @param {object} [body] creation parameters
   * @param {string} [body.name] a string to identify the offer. Cannot be empty.
   * @param {string} [body.content] the content of the offer shown to the user.
   * @param {string} [body.workspace] the optional id of the workspace to which the offer belongs.
   */
  async createTargetOffer(body = null) {
    const response = await this.targetClient.createOffer(body)
    if (!response.ok) {
      throw new Error(`Error creating the offer with body ${body}`)
    }
    return response.body
  }

  /**
   * Creates an Adobe Target offer
   *
   * @param {string} [id] the id of the Adobe Target offer to update
   * @param {object} [body] creation parameters
   * @param {string} [body.name] a string to identify the offer. Cannot be empty.
   * @param {string} [body.content] the content of the offer shown to the user.
   */
  async updateTargetOffer(id = null, body = null) {
    const response = await this.targetClient.updateOffer(id, body)
    if (!response.ok) {
      throw new Error(`Error updating the offer with id ${id}`)
    }
    return response.body
  }

  /**
   * Creates an Adobe Target offer
   *
   * @param {string} [id] the id of the Adobe Target offer to delete
   */
  async deleteTargetOffer(id = null) {
    const response = await this.targetClient.deleteOffer(id)
    if (!response.ok) {
      throw new Error(`Error deleting the offer with id ${id}`)
    }
    return response.body
  }

}

TargetCommand.flags = {
  help: flags.boolean({ description: 'Shows help' })
}

// this is set in package.json, see https://github.com/oclif/oclif/issues/120
// if not set it will get the first (alphabetical) topic's help description
TargetCommand.description = 'Adobe Target plugin for the Adobe I/O CLI'
TargetCommand.examples = [
  '$ aio target:offer',
  '$ aio target:activity',
]

module.exports = TargetCommand