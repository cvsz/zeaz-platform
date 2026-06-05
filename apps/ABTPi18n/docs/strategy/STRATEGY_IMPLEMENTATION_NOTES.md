# Strategy Implementation Notes

## Confidence Heuristics

All trading strategies in ABTPi18n should return a confidence score (0.0 to 1.0) alongside their signals. This helps the system assess signal quality and make better risk management decisions.

### General Guidelines

1. **Confidence Scaling**: Scale confidence based on signal strength
   - Strong signals (clear indicators): confidence → 0.7-1.0
   - Moderate signals: confidence → 0.4-0.7
   - Weak signals: confidence → 0.1-0.4
   - HOLD signals: reduced confidence (typically 0.0-0.3)

2. **Multi-Indicator Combination**: When using multiple indicators, use weighted averages
   ```python
   confidence = (indicator1_conf * weight1) + (indicator2_conf * weight2)
   ```

3. **Normalization**: Always normalize confidence to [0.0, 1.0] range
   ```python
   confidence = min(max(raw_confidence, 0.0), 1.0)
   ```

### Strategy-Specific Approaches

#### Mean Reversion Strategy
- **Z-score based**: `abs(z_score) / z_entry_threshold`
  - Higher deviation from mean → higher confidence
- **Bollinger Band position**: `distance_from_mean / (band_width / 2)`
  - Price near bands → higher confidence
- **Combined**: Weighted average (60% Z-score, 40% band position)

#### RSI Cross Strategy
- **Distance from neutral**: `abs(rsi - 50) / 50`
  - Extreme RSI values → higher confidence
- **Band proximity**: Distance to overbought/oversold threshold
  - Closer to threshold → higher confidence

#### Breakout Strategy
- **Volume confirmation**: `(current_volume - avg_volume) / avg_volume`
  - Higher volume → higher confidence
- **Price momentum**: Rate of price change
  - Stronger breakout → higher confidence

#### VWAP Strategy
- **Price deviation**: `abs(price - vwap) / price`
  - Larger deviation → higher confidence
- **Volume weight**: Factor in current volume vs average

## Fallback Behavior

All strategies must handle edge cases gracefully and return appropriate HOLD signals with explanatory metadata.

### Required Error Handling

1. **Insufficient Data**
   ```python
   if len(closes) < minimum_required:
       return {
           "signal": "HOLD",
           "confidence": 0.0,
           "meta": {
               "reason": f"Insufficient data: need {minimum_required}, got {len(closes)}"
           }
       }
   ```

2. **NaN Values**
   ```python
   if pd.isna([critical_value1, critical_value2]).any():
       return {
           "signal": "HOLD",
           "confidence": 0.0,
           "meta": {
               "reason": "Insufficient historical data for calculation (NaN values)"
           }
       }
   ```

3. **Invalid Input Data**
   ```python
   if not closes:
       return {
           "signal": "HOLD",
           "confidence": 0.0,
           "meta": {"reason": "No price data provided"}
       }
   ```

4. **Division by Zero Protection**
   ```python
   # Use pandas .replace() or conditional checks
   z_score = (series - ma) / std.replace(0, np.nan)
   
   # Or with conditionals
   confidence = value / divisor if divisor > 0 else 0.0
   ```

### Response Structure

All strategies must return a dictionary with this structure:

```python
{
    "signal": str,        # "BUY", "SELL", or "HOLD"
    "confidence": float,  # 0.0 to 1.0
    "meta": dict         # Additional metadata
}
```

#### Meta Field Contents

Required in `meta`:
- `reason`: Explanation for HOLD signals or signal rationale

Recommended in `meta`:
- Indicator values used in decision
- Parameter values
- Any relevant thresholds or conditions

Example:
```python
"meta": {
    "reason": "Oversold: Z-score -2.34 < -2.0",
    "z_score": -2.34,
    "bands": {
        "upper": 105.50,
        "middle": 100.00,
        "lower": 94.50
    },
    "window": 20,
    "z_entry": 2.0
}
```

## Testing Recommendations

### Unit Tests

1. **Test with sufficient data**: Verify normal operation
2. **Test with insufficient data**: Ensure graceful fallback
3. **Test with NaN values**: Handle calculation errors
4. **Test edge cases**: Empty data, single value, extreme values
5. **Test confidence scaling**: Verify range [0.0, 1.0]

### Integration Tests

1. **Backtesting**: Run against historical data
2. **Performance metrics**: Sharpe ratio, max drawdown, win rate
3. **Signal distribution**: Verify BUY/SELL/HOLD balance
4. **Confidence correlation**: Higher confidence → better outcomes

## Best Practices

1. **Type Safety**: Use type hints for all parameters and returns
2. **Documentation**: Include docstrings explaining strategy logic
3. **Logging**: Log decisions without sensitive data
4. **Performance**: Keep `execute()` runtime under 500ms
5. **Statelessness**: Minimize mutable state (or document it clearly)
6. **Registration**: Always call `StrategyRegistry.register()` after class definition

## Example Implementation

See `apps/backend/src/trading/strategies/mean_reversion_strategy.py` for a complete example that demonstrates:
- Z-score calculation
- Hysteresis (entry/exit thresholds)
- Confidence scaling
- NaN handling
- Proper meta information
- Fallback behavior
