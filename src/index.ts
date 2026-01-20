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
    // Document Service middleware for publish/unpublish only
    strapi.documents.use(async (context, next) => {
      const { action, uid } = context;

      // Execute the action first
      const result = await next();

      // Trigger rebuild only for publish/unpublish actions
      if (action === 'publish' || action === 'unpublish') {
        strapi.log.info(`Document ${action}ed in ${uid}. Triggering rebuild...`);
        await triggerFrontendRebuild(strapi);
      }

      return result;
    });
  },
};
