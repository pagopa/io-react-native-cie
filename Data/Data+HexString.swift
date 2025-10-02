//
//  Data+HexString.swift
//  Pods
//
//  Created by Fabio Bombardi on 02/10/25.
//

import Foundation

// Estensione per convertire Data in una stringa esadecimale
extension Data {
    func toHexString() -> String {
        return self.map { String(format: "%02x", $0) }.joined()
    }
}

// Estensione (opzionale) per [UInt8] per comodità
extension Array where Element == UInt8 {
    func toHexString() -> String {
        return Data(self).toHexString()
    }
}
