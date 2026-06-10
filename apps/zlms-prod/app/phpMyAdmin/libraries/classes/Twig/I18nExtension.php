<?php
/* vim: set expandtab sw=4 ts=4 sts=4: */
/**
 * hold PhpMyAdmin\Twig\I18nExtension class
 *
 * @package PhpMyAdmin\Twig
 */
namespace PhpMyAdmin\Twig;

use PhpMyAdmin\Twig\I18n\TokenParserTrans;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

/**
 * Class I18nExtension
 *
 * @package PhpMyAdmin\Twig
 */
class I18nExtension extends AbstractExtension
{
    /**
     * Returns the token parser instances to add to the existing list.
     *
     * @return \Twig\TokenParser\TokenParserInterface[]
     */
    public function getTokenParsers()
    {
        return array(new TokenParserTrans());
    }

    /**
     * Returns a list of filters to add to the existing list.
     *
     * @return TwigFilter[]
     */
    public function getFilters()
    {
        return array(
             new TwigFilter('trans', '_gettext'),
        );
    }
}
