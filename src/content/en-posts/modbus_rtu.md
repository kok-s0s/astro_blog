---
title: 'Practicing the Modbus RTU Industrial Communication Protocol'
description: 'Notes from using RS485 + Modbus RTU for business data transmission in a desktop/client application.'
---

> After reviewing the work, there was actually nothing especially difficult. It was just that in the DDD domain-driven development context of industrial automation, some technical terms in this field were still unfamiliar to me. Starting development directly came with a little confusion. The RS485 physical-layer protocol itself is quite simple. In fact, as an upper-computer application developer, I do not need to care too much about the physical-layer details. The key is how to use the Modbus industrial communication protocol according to the business requirement.

> The latest term for the RS485 physical-layer protocol on Wikipedia is now [EIA-485](https://zh.wikipedia.org/wiki/EIA-485).

## Why

The application I am currently developing needs to connect to an external hardware device. Data interaction between the application and the device happens through the `RS485` protocol, which belongs to the physical layer in the [OSI](https://zh.wikipedia.org/wiki/OSI%E6%A8%A1%E5%9E%8B) model.

## Goal

The goal is to make data interaction between the application and hardware device work: complete data sending and receiving, then implement the related business features. The confusing part was data send/receive processing. The business feature development itself was much simpler.

## Learning by Analogy + ChatGPT

As the master side of communication, the application uses a company-encapsulated SDK interface to read and write device registers through the `ModbusRTU` protocol.

As the slave side of communication, the device uses `ModbusRTU` classes from the Qt ecosystem to read and write device registers.

Both sides are essentially using the `ModbusRTU` industrial communication protocol.

![](/images/modbus_rtu/handle.svg)

In the whole data interaction development process, I only used function code `0x03`, [Read Holding Registers](http://www.microshadow.com/ladderdip/html/modbus_rtu_read_holding_registers.htm), and function code `0x10`, [Write Multiple Registers](http://www.microshadow.com/ladderdip/html/modbus_rtu_write_multiple_registers.htm).

I also became familiar with how the Qt ecosystem uses the `ModbusRTU` protocol through `QModbusRtuSerialSlave`.

The rest was mainly learning through Q&A with ChatGPT and modifying code.

## Notes from GPT Q&A and My Understanding

> Modbus is a communication protocol widely used in industrial automation. It is mainly used for data exchange between industrial devices such as PLCs, sensors, frequency converters, instruments, and so on.

### Industrial Properties of Modbus

| **Property** | **Description** |
| --- | --- |
| **Design intent** | Designed for industrial environments, emphasizing simplicity, reliability, and real-time behavior. |
| **Typical scenarios** | Factory automation, SCADA systems, power monitoring, building control, etc. |
| **Hardware compatibility** | Supports RS485, RS232, and Ethernet through Modbus TCP, adapting to industrial field wiring. |
| **Protocol simplicity** | Compact frame structure, easy for embedded devices to implement, suitable for resource-limited industrial controllers. |
| **Master-slave architecture** | Suitable for centralized monitoring in industrial control, such as a PLC as master and sensors/actuators as slaves. |

### Industrial Application Examples of Modbus

- **PLC communication**: Siemens, Schneider, and other PLCs communicate with peripheral devices through Modbus.
- **Sensor data acquisition**: temperature and pressure sensors report data through Modbus RTU.
- **Frequency converter control**: control motor speed, such as ABB converters supporting Modbus.
- **Power monitoring**: electric meters use Modbus to transmit voltage and current data.
- **HMI-device interaction**: touch screens access PLC data through Modbus TCP.

### Why Is Modbus Popular in Industry?

- **Standardized**: an open protocol without copyright restrictions, widely supported by vendors.
- **Low overhead**: simple protocol with low hardware resource requirements, suitable for low-cost embedded devices.
- **Flexible**: supports multiple physical layers such as RS485, RS232, and TCP.
- **Mature and stable**: introduced in 1979 and validated in industrial sites for a long time.

### Limitations of Modbus

- **No built-in security**: no encryption or authentication, so it needs physical isolation or firewall protection.
- **Limited real-time performance**: slower than modern industrial protocols such as EtherCAT and PROFINET.
- **Data size limits**: the number of registers per read/write is limited, such as a maximum of 123 registers for Modbus RTU.

### Comparing Modbus with Other Industrial Protocols

| **Protocol** | **Layer** | **Characteristics** | **Suitable scenarios** |
| --- | --- | --- | --- |
| **Modbus** | Application layer | Simple, general-purpose, low cost | Small and medium industrial control systems |
| **PROFINET** | Real-time Ethernet | High speed and deterministic latency | High-performance automation, such as automotive manufacturing |
| **EtherCAT** | Real-time Ethernet | Distributed clocks and ultra-low latency | Precision motion control, such as robotics |
| **CANopen** | Data link layer | Strong anti-interference and multi-master architecture | Vehicles and engineering machinery |

## End

I have now entered one more knowledge domain. When I run into similar problems later, they should be much easier to handle.

