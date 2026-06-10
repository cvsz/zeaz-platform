export type VHostTemplateGroup = {
  name: string;
  slug: string;
  summary: string;
  kind: "app" | "platform" | "special";
};

export const vhostTemplateSource = "cloudpanel-io/vhost-templates/tree/master/v2";

export const vhostTemplateGroups: VHostTemplateGroup[] = [
  { name: "CakePHP", slug: "cakephp", summary: "PHP app template for CakePHP deployments.", kind: "app" },
  { name: "CodeIgniter", slug: "codeigniter", summary: "PHP app template for CodeIgniter sites.", kind: "app" },
  { name: "Contao", slug: "contao", summary: "CMS-oriented PHP vhost template.", kind: "app" },
  { name: "Drupal", slug: "drupal", summary: "Drupal application vhost template.", kind: "app" },
  { name: "FuelPHP", slug: "fuelphp", summary: "FuelPHP application template.", kind: "app" },
  { name: "Generic", slug: "generic", summary: "Baseline template for custom app routing.", kind: "platform" },
  { name: "Joomla", slug: "joomla", summary: "Joomla deployment template.", kind: "app" },
  { name: "Laminas", slug: "laminas", summary: "Laminas framework vhost template.", kind: "app" },
  { name: "Laravel", slug: "laravel", summary: "Laravel application vhost template.", kind: "app" },
  { name: "Magento", slug: "magento", summary: "Magento commerce deployment template.", kind: "app" },
  { name: "Matomo", slug: "matomo", summary: "Matomo analytics template.", kind: "app" },
  { name: "Mautic", slug: "mautic", summary: "Mautic marketing automation template.", kind: "app" },
  { name: "Moodle", slug: "moodle", summary: "Moodle LMS template.", kind: "app" },
  { name: "Neos", slug: "neos", summary: "Neos CMS template.", kind: "app" },
  { name: "Nextcloud", slug: "nextcloud", summary: "Nextcloud file collaboration template.", kind: "app" },
  { name: "Nodejs", slug: "nodejs", summary: "Node.js runtime template.", kind: "platform" },
  { name: "OroCRM", slug: "orocrm", summary: "OroCRM vhost template.", kind: "app" },
  { name: "OroCommerce", slug: "orocommerce", summary: "OroCommerce deployment template.", kind: "app" },
  { name: "PrestaShop", slug: "prestashop", summary: "PrestaShop e-commerce template.", kind: "app" },
  { name: "Python", slug: "python", summary: "Python application template.", kind: "platform" },
  { name: "Shopware", slug: "shopware", summary: "Shopware commerce template.", kind: "app" },
  { name: "Slim", slug: "slim", summary: "Slim framework template.", kind: "app" },
  { name: "Static", slug: "static", summary: "Static site template.", kind: "platform" },
  { name: "Symfony", slug: "symfony", summary: "Symfony application template.", kind: "app" },
  { name: "TYPO3", slug: "typo3", summary: "TYPO3 CMS template.", kind: "app" },
  { name: "WHMCS", slug: "whmcs", summary: "WHMCS billing template.", kind: "app" },
  { name: "WooCommerce", slug: "woocommerce", summary: "WooCommerce store template.", kind: "app" },
  { name: "WordPress", slug: "wordpress", summary: "WordPress template family.", kind: "app" },
  { name: "Yii", slug: "yii", summary: "Yii framework template.", kind: "app" },
  { name: "ownCloud", slug: "owncloud", summary: "ownCloud collaboration template.", kind: "app" },
  { name: "v2-http3", slug: "v2-http3", summary: "HTTP/3 variant of the v2 template set.", kind: "special" },
  { name: "v2-varnish", slug: "v2-varnish", summary: "Varnish-enabled variant of the v2 template set.", kind: "special" },
];
