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
const aioTargetLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-target:offer:get', { provider: 'debug' })
const { flags } = require('@oclif/command')
const { cli } = require('cli-ux')

const TargetCommand = require('../index')

class GetCommand extends TargetCommand {
  async run () {
    const { args, flags } = this.parse(GetCommand)

    await this.initSdk()

    try {
      aioTargetLogger.debug('Get Target Offer')

      cli.action.start(`Retrieving the Adobe Target Offer with id: ${args.offerId}`)
      const offer = await this.getTargetOffer(args.offerId)
      if (!offer) {
        throw new Error('Invalid Offer Id!')
      }

      cli.action.stop()

      aioConsoleLogger.debug(`Getting Adobe Target Offer ${args.offerId}: Data received`)

      if (flags.json) {
        this.printJson(offer)
      } else if (flags.yml) {
        this.printYaml(offer)
      } else {
        this.printResults(offer)
      }
    } catch (err) {
      aioTargetLogger.debug(err)
      this.error(err.message)
    } finally {
      cli.action.stop()
    }
  }

  /**
   * Print Offer
   *
   * @param {id, name, type, modifiedAt, workspace} offer the offer to get
   */
  printResults (offer) {
    cli.styledObject(offer, ['id', 'name', 'content', 'modifiedAt', 'workspace'])
  }
}

GetCommand.description = 'Get an Adobe Target Offer'

GetCommand.args = [
  {
    name: 'offerId',
    required: true,
    description: 'The identifier of the offer. The id cannot be empty.'
  }
]

GetCommand.flags = {
    ...TargetCommand.flags,
    json: flags.boolean({
      description: 'Output json',
      char: 'j',
      exclusive: ['yml']
    }),
    yml: flags.boolean({
      description: 'Output yml',
      char: 'y',
      exclusive: ['json']
    })
}

GetCommand.aliases = [
  'target:offer:get'
]

module.exports = GetCommand