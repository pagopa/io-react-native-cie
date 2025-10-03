//
//  DataEncoding.swift
//  Pods
//
//  Created by Fabio Bombardi on 02/10/25.
//

enum DataEncoding: String, Sendable {
  case HEX = "HEX"
  case BASE64 = "BASE64"
  
  static func from(string: String?) -> DataEncoding {         
    return DataEncoding(rawValue: string?.uppercased() ?? "") ?? .BASE64
  }
}
