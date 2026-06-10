<?php
/* vim: set expandtab sw=4 ts=4 sts=4: */
/**
 * hold PhpMyAdmin\Twig\I18n\TokenParserTrans class
 *
 * @package PhpMyAdmin\Twig\I18n
 */
namespace PhpMyAdmin\Twig\I18n;

use Twig\Error\SyntaxError;
use Twig\Node\Expression\NameExpression;
use Twig\Node\Node;
use Twig\Node\PrintNode;
use Twig\Node\TextNode;
use Twig\Token;
use Twig\TokenParser\AbstractTokenParser;

/**
 * Class TokenParserTrans
 *
 * @package PhpMyAdmin\Twig\I18n
 */
class TokenParserTrans extends AbstractTokenParser
{
    /**
     * Parses a token and returns a node.
     *
     * @param Token $token Twig token to parse
     *
     * @return NodeTrans
     *
     * @throws SyntaxError
     */
    public function parse(Token $token)
    {
        $lineno = $token->getLine();
        $stream = $this->parser->getStream();
        $count = null;
        $plural = null;
        $notes = null;
        $context = null;

        if (!$stream->test(Token::BLOCK_END_TYPE)) {
            $body = $this->parser->parseExpression();
        } else {
            $stream->expect(Token::BLOCK_END_TYPE);
            $body = $this->parser->subparse(array($this, 'decideForFork'));
            $next = $stream->next()->getValue();

            if ('plural' === $next) {
                $count = $this->parser->parseExpression();
                $stream->expect(Token::BLOCK_END_TYPE);
                $plural = $this->parser->subparse(array($this, 'decideForFork'));

                if ('notes' === $stream->next()->getValue()) {
                    $stream->expect(Token::BLOCK_END_TYPE);
                    $notes = $this->parser->subparse(array($this, 'decideForEnd'), true);
                }
            } elseif ('context' === $next) {
                $stream->expect(Token::BLOCK_END_TYPE);
                $context = $this->parser->subparse(array($this, 'decideForEnd'), true);
            } elseif ('notes' === $next) {
                $stream->expect(Token::BLOCK_END_TYPE);
                $notes = $this->parser->subparse(array($this, 'decideForEnd'), true);
            }
        }

        $stream->expect(Token::BLOCK_END_TYPE);

        $this->checkTransString($body, $lineno);

        return new NodeTrans($body, $plural, $count, $context, $notes, $lineno, $this->getTag());
    }

    /**
     * Tests the current token for a type.
     *
     * @param Token $token Twig token to test
     *
     * @return bool
     */
    public function decideForFork(Token $token)
    {
        return $token->test(array('plural', 'context', 'notes', 'endtrans'));
    }

    /**
     * Tests the current token for the endtrans tag.
     *
     * @param Token $token Twig token to test
     *
     * @return bool
     */
    public function decideForEnd(Token $token)
    {
        return $token->test('endtrans');
    }

    /**
     * Returns the tag name associated with this token parser.
     *
     * @return string
     */
    public function getTag()
    {
        return 'trans';
    }

    /**
     * @param Node $body   Translated body node
     * @param int  $lineno Template line number
     *
     * @return void
     *
     * @throws SyntaxError
     */
    protected function checkTransString(Node $body, $lineno)
    {
        foreach ($body as $node) {
            if (
                $node instanceof TextNode
                ||
                ($node instanceof PrintNode && $node->getNode('expr') instanceof NameExpression)
            ) {
                continue;
            }

            throw new SyntaxError(
                'The text to be translated with "trans" can only contain references to simple variables',
                $lineno
            );
        }
    }
}
