import type { Core } from '@strapi/strapi';
import { triggerFrontendRebuild } from './utils/github-webhook';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Database lifecycle hooks for create/update/delete
    strapi.db.lifecycles.subscribe({
      models: [
        'api::about.about',
        'api::art-piece.art-piece',
        'api::artist.artist',
        'api::event.event',
        'api::global.global',
      ],
      async afterCreate() {
        await triggerFrontendRebuild();
      },
      async afterUpdate() {
        await triggerFrontendRebuild();
      },
      async afterDelete() {
        await triggerFrontendRebuild();
      },
    });

    // Document Service middleware for publish/unpublish
    strapi.documents.use(async (context, next) => {
      const { action, uid } = context;

      // Execute the action first
      const result = await next();

      // Trigger rebuild for publish/unpublish actions
      if (action === 'publish' || action === 'unpublish') {
        strapi.log.info(`Document ${action}ed in ${uid}. Triggering rebuild...`);
        await triggerFrontendRebuild();
      }

      return result;
    });
  },
};
