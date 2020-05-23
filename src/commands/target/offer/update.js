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

const aioTargetLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-target:offer:create', { provider: 'debug' })
const { flags } = require('@oclif/command')
const { cli } = require('cli-ux')

const TargetCommand = require('../index')

class UpdateCommand extends TargetCommand {
  async run () {
    const { args, flags } = this.parse(UpdateCommand)

    await this.initSdk()

    try {
      aioTargetLogger.debug('Updating Adobe Target Offer')
      const body = {}
      body.name = args.offerName
      body.content = args.offerContent
      cli.action.start('Updating Offer')
      const offer = await this.updateTargetOffer(args.offerId, body)
      cli.action.stop()

      aioTargetLogger.debug('Updating Adobe Target Offer: Data received')

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
   * Print Updated Offer
   *
   * @param {id, name, type, modifiedAt, workspace} offer the offer to update
   */
  printResults (offer) {
    cli.styledObject(offer, ['id', 'name', 'content', 'modifiedAt', 'workspace'])
  }
}

UpdateCommand.description = 'Update an Adobe Target Offer'

UpdateCommand.args = [
  {
    name: 'offerId',
    required: true,
    description: 'The identifier of the offer. The id cannot be empty.'
  },
  {
    name: 'offerName',
    required: true,
    description: 'A string to identify the Offer. The name cannot be empty. Max length is 250 characters.'
  },
  {
    name: 'offerContent',
    required: true,
    description: 'Content of an Offer shown to user'
  }
]

UpdateCommand.flags = {
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

UpdateCommand.aliases = [
  'target:offer:update'
]

module.exports = UpdateCommand