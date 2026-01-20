import { triggerFrontendRebuild } from '../../../../utils/github-webhook';

export default {
  async afterCreate() {
    await triggerFrontendRebuild();
  },
  async afterUpdate() {
    await triggerFrontendRebuild();
  },
  async afterDelete() {
    await triggerFrontendRebuild();
  },
};
