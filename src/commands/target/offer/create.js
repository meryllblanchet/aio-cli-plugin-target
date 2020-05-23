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

class CreateCommand extends TargetCommand {
  async run () {
    const { args, flags } = this.parse(CreateCommand)

    await this.initSdk()

    try {
      aioTargetLogger.debug('Creating Adobe Target Offer')
      const body = {}
      body.name = args.offerName
      body.content = args.offerContent
      body.workspace = flags.workspace
      cli.action.start('Creating Adobe Target Offer')
      const offer = await this.createTargetOffer(body)
      cli.action.stop()

      aioTargetLogger.debug('Creating Adobe Target Offer: Data received')

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
   * Print Created Offer
   *
   * @param {id, name, type, modifiedAt, workspace} offer the offer to create
   */
  printResults (offer) {
    cli.styledObject(offer, ['id', 'name', 'content', 'modifiedAt', 'workspace'])
  }
}

CreateCommand.description = 'Create an Adobe Target Offer'

CreateCommand.args = [
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

CreateCommand.flags = {
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
  }),
  workspace: flags.string({
      description: 'Optional id of workspace to which the activity belongs. Max length is 250 characters. By default, Default workspace is assumed. Applicable for Enterprise Permissions (Target Premium).',
      char: 'w'
  })
}

CreateCommand.aliases = [
  'target:offer:create'
]

module.exports = CreateCommand