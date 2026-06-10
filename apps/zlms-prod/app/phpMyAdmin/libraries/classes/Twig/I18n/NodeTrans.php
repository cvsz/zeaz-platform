<?php
/* vim: set expandtab sw=4 ts=4 sts=4: */
/**
 * hold PhpMyAdmin\Twig\I18n\NodeTrans class
 *
 * @package PhpMyAdmin\Twig\I18n
 */
namespace PhpMyAdmin\Twig\I18n;

use Twig\Compiler;
use Twig\Node\Expression\AbstractExpression;
use Twig\Node\Expression\ConstantExpression;
use Twig\Node\Expression\FilterExpression;
use Twig\Node\Expression\NameExpression;
use Twig\Node\Expression\TempNameExpression;
use Twig\Node\Node;
use Twig\Node\PrintNode;

/**
 * Class NodeTrans
 *
 * @package PhpMyAdmin\Twig\I18n
 */
class NodeTrans extends Node
{
    /**
     * Constructor.
     *
     * The nodes are automatically made available as properties ($this->node).
     * The attributes are automatically made available as array items ($this['name']).
     *
     * @param Node               $body    Body of node trans
     * @param Node               $plural  Node plural
     * @param AbstractExpression $count   Node count
     * @param Node               $context Node context
     * @param Node               $notes   Node notes
     * @param int                $lineno  The line number
     * @param string             $tag     The tag name associated with the Node
     */
    public function __construct(
        Node $body,
        Node $plural = null,
        AbstractExpression $count = null,
        Node $context = null,
        Node $notes = null,
        $lineno,
        $tag = null
    ) {
        $nodes = array('body' => $body);
        if (null !== $count) {
            $nodes['count'] = $count;
        }
        if (null !== $plural) {
            $nodes['plural'] = $plural;
        }
        if (null !== $context) {
            $nodes['context'] = $context;
        }
        if (null !== $notes) {
            $nodes['notes'] = $notes;
        }

        Node::__construct($nodes, array(), $lineno, $tag);
    }

    /**
     * Compiles the node to PHP.
     *
     * @param Compiler $compiler Node compiler
     *
     * @return void
     */
    public function compile(Compiler $compiler)
    {
        $compiler->addDebugInfo($this);

        list($msg, $vars) = $this->compileString($this->getNode('body'));

        if ($this->hasNode('plural')) {
            list($msg1, $vars1) = $this->compileString($this->getNode('plural'));

            $vars = array_merge($vars, $vars1);
        }

        $function = $this->getTransFunction(
            $this->hasNode('plural'),
            $this->hasNode('context')
        );

        if ($this->hasNode('notes')) {
            $message = trim($this->getNode('notes')->getAttribute('data'));

            // line breaks are not allowed cause we want a single line comment
            $message = str_replace(array("\n", "\r"), ' ', $message);
            $compiler->write("// l10n: {$message}\n");
        }

        if ($vars) {
            $compiler
                ->write('echo strtr(' . $function . '(')
                ->subcompile($msg)
            ;

            if ($this->hasNode('plural')) {
                $compiler
                    ->raw(', ')
                    ->subcompile($msg1)
                    ->raw(', abs(')
                    ->subcompile($this->hasNode('count') ? $this->getNode('count') : null)
                    ->raw(')')
                ;
            }

            $compiler->raw('), array(');

            foreach ($vars as $var) {
                if ('count' === $var->getAttribute('name')) {
                    $compiler
                        ->string('%count%')
                        ->raw(' => abs(')
                        ->subcompile($this->hasNode('count') ? $this->getNode('count') : null)
                        ->raw('), ')
                    ;
                } else {
                    $compiler
                        ->string('%' . $var->getAttribute('name') . '%')
                        ->raw(' => ')
                        ->subcompile($var)
                        ->raw(', ')
                    ;
                }
            }

            $compiler->raw("));\n");
        } else {
            $compiler->write('echo ' . $function . '(');

            if ($this->hasNode('context')) {
                $context = trim($this->getNode('context')->getAttribute('data'));
                $compiler->write('"' . $context . '", ');
            }

            $compiler->subcompile($msg);

            if ($this->hasNode('plural')) {
                $compiler
                    ->raw(', ')
                    ->subcompile($msg1)
                    ->raw(', abs(')
                    ->subcompile($this->hasNode('count') ? $this->getNode('count') : null)
                    ->raw(')')
                ;
            }

            $compiler->raw(");\n");
        }
    }

    /**
     * @param Node $body Body node
     *
     * @return array
     */
    protected function compileString(Node $body)
    {
        if (
            $body instanceof NameExpression
            || $body instanceof ConstantExpression
            || $body instanceof TempNameExpression
        ) {
            return array($body, array());
        }

        $vars = array();
        if (count($body)) {
            $msg = '';

            foreach ($body as $node) {
                if ($node instanceof PrintNode) {
                    $n = $node->getNode('expr');
                    while ($n instanceof FilterExpression) {
                        $n = $n->getNode('node');
                    }
                    $msg .= sprintf('%%%s%%', $n->getAttribute('name'));
                    $vars[] = new NameExpression($n->getAttribute('name'), $n->getTemplateLine());
                } else {
                    $msg .= $node->getAttribute('data');
                }
            }
        } else {
            $msg = $body->getAttribute('data');
        }

        return array(
            new Node(array(new ConstantExpression(trim($msg), $body->getTemplateLine()))),
            $vars,
        );
    }

    /**
     * @param bool $plural        Return plural or singular function to use
     * @param bool $hasMsgContext It has message context?
     *
     * @return string
     */
    protected function getTransFunction($plural, $hasMsgContext = false)
    {
        if ($hasMsgContext) {
            return $plural ? '_ngettext' : '_pgettext';
        }

        return $plural ? '_ngettext' : '_gettext';
    }
}
