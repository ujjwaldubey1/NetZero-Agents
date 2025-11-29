pragma circom 2.0.0;
include "circomlib/circuits/comparators.circom";

// Scope 3 emissions threshold verification circuit
component main { public [value, threshold] } = LessThan(16);

