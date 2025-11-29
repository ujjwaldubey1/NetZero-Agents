pragma circom 2.0.0;
include "circomlib/circuits/comparators.circom";

component main { public [value, threshold] } = LessThan(16);
