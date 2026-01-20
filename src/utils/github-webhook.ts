/**
 * Utility to trigger GitHub Actions workflow via repository_dispatch
 */
export const triggerFrontendRebuild = async () => {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubOwner = process.env.GITHUB_OWNER;
  const githubRepo = process.env.GITHUB_REPO;

  if (!githubToken || !githubOwner) {
    strapi.log.warn(
      'GitHub webhook not configured. Set GITHUB_TOKEN and GITHUB_OWNER environment variables.'
    );
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'strapi-content-updated',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      strapi.log.error(
        `Failed to trigger GitHub workflow: ${response.status} ${errorText}`
      );
      return;
    }

    strapi.log.info('Successfully triggered frontend rebuild via GitHub webhook');
  } catch (error) {
    strapi.log.error('Error triggering GitHub webhook:', error);
  }
};
