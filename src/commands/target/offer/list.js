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

const aioTargetLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-target:offer:list', { provider: 'debug' })
const { flags } = require('@oclif/command')
const { cli } = require('cli-ux')

const TargetCommand = require('../index')

class ListCommand extends TargetCommand {
  async run () {
    const { flags } = this.parse(ListCommand)

    await this.initSdk()

    try {
      aioTargetLogger.debug('Listing Adobe Target Offers')
      const config = {}
      config.limit = flags.limit
      config.offset = flags.offset
      config.sortBy = flags.sortBy
      cli.action.start('Retrieving Offers')
      const offers = await this.listTargetOffers(config)
      cli.action.stop()

      aioTargetLogger.debug('Listing Adobe Target Offers: Data received')

      if (flags.json) {
        this.printJson(offers)
      } else if (flags.yml) {
        this.printYaml(offers)
      } else {
        this.printResults(offers.offers)
      }
    } catch (err) {
      aioTargetLogger.debug(err)
      this.error(err.message)
    } finally {
      cli.action.stop()
    }
  }

  /**
   * Print Offers list
   *
   * @param {Array<{id, name, type, modifiedAt, workspace}>} offers list of offers
   */
  printResults (offers = []) {
    const columns = {
      id: {
        header: 'ID'
      },
      name: {
        header: 'Name'
      },
      type: {
        header: 'Type'
      },
      modifiedAt: {
        header: 'Modified At'
      },
      workspace: {
        header: 'Workspace'
      }
    }
    cli.table(offers, columns)
  }
}

ListCommand.description = 'List your Adobe Target Offers'

ListCommand.flags = {
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
  limit: flags.string({
      description: 'Defines the number of items to return. Default value is 2147483647.',
      char: 'l'
  }),
  offset: flags.string({
      description: 'Defines the first offer to return from the list of total offers. Used in conjunction with limit, you can provide pagination in your application for users to browse through a large set of offers.',
      char: 'o'
  }),
  sortBy: flags.string({
      description: 'Defines the sorting criteria on the returned items. You can add a “-” modifier to sort by descending order.',
      char: 's'
  })
}

ListCommand.aliases = [
  'target:offer:list'
]

module.exports = ListCommand